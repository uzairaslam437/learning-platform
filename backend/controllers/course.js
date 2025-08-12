const {pool} = require("../model/db");
const { v4: uuidv4 } = require('uuid');
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const AWS = require('aws-sdk');
const path = require('path');

// AWS S3 configuration
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      currency = "PKR",
      category,
      max_students,
      thumbnail_url,
    } = req.body;

    const instructorId = req.user.id;

    // Validation
    if (!title || !description || !price) {
      return res.status(400).json({
        error: "Title, description, and price are required",
      });
    }

    if (price < 0) {
      return res.status(400).json({
        error: "Price must be a positive number",
      });
    }

    const query = `
      INSERT INTO courses (
        instructor_id, title, description, price, currency, 
        category, max_students, thumbnail_url
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *
    `;

    const values = [
      instructorId,
      title,
      description,
      price,
      currency,
      category,
      max_students,
      thumbnail_url,
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      course: result.rows[0],
    });
  } catch (error) {
    console.error("Create course error:", error);
    res.status(500).json({
      error: "Failed to create course",
      details: error.message,
    });
  }
};

const getAllCourses = async (req, res) => {
  try {
    const { category, instructor_id, status = "published" } = req.query;

    let query = `
      SELECT c.*, u.first_name, u.last_name,
             COUNT(cm.id) as material_count,
             COUNT(e.id) as enrolled_count
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      LEFT JOIN course_materials cm ON c.id = cm.course_id
      LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'active'
      WHERE c.status = $1
    `;

    const queryParams = [status];
    let paramIndex = 2;

    if (category) {
      query += ` AND c.category = $${paramIndex}`;
      queryParams.push(category);
      paramIndex++;
    }

    if (instructor_id) {
      query += ` AND c.instructor_id = $${paramIndex}`;
      queryParams.push(instructor_id);
      paramIndex++;
    }

    query += ` GROUP BY c.id, u.first_name, u.last_name ORDER BY c.created_at DESC`;

    const result = await pool.query(query, queryParams);

    res.json({
      success: true,
      courses: result.rows,
    });
  } catch (error) {
    console.error("Get courses error:", error);
    res.status(500).json({
      error: "Failed to retrieve courses",
    });
  }
};

const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;

    const query = `
      SELECT c.*, u.first_name, u.last_name, u.email as instructor_email,
             COUNT(cm.id) as material_count,
             COUNT(e.id) as enrolled_count
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      LEFT JOIN course_materials cm ON c.id = cm.course_id
      LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'active'
      WHERE c.id = $1
      GROUP BY c.id, u.first_name, u.last_name, u.email
    `;

    const result = await pool.query(query, [courseId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Course not found",
      });
    }

    res.json({
      success: true,
      course: result.rows[0],
    });
  } catch (error) {
    console.error("Get course error:", error);
    res.status(500).json({
      error: "Failed to retrieve course",
    });
  }
};

const updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const {
      title,
      description,
      price,
      currency,
      category,
      status,
      duration_minutes,
      max_students,
      thumbnail_url,
    } = req.body;

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex}`);
      values.push(title);
      paramIndex++;
    }

    if (description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      values.push(description);
      paramIndex++;
    }

    if (price !== undefined) {
      if (price < 0) {
        return res.status(400).json({
          error: "Price must be a positive number",
        });
      }
      updates.push(`price = $${paramIndex}`);
      values.push(price);
      paramIndex++;
    }

    if (currency !== undefined) {
      updates.push(`currency = $${paramIndex}`);
      values.push(currency);
      paramIndex++;
    }

    if (category !== undefined) {
      updates.push(`category = $${paramIndex}`);
      values.push(category);
      paramIndex++;
    }

    if (status !== undefined) {
      updates.push(`status = $${paramIndex}`);
      values.push(status);
      paramIndex++;
    }

    if (duration_minutes !== undefined) {
      updates.push(`duration_minutes = $${paramIndex}`);
      values.push(duration_minutes);
      paramIndex++;
    }

    if (max_students !== undefined) {
      updates.push(`max_students = $${paramIndex}`);
      values.push(max_students);
      paramIndex++;
    }

    if (thumbnail_url !== undefined) {
      updates.push(`thumbnail_url = $${paramIndex}`);
      values.push(thumbnail_url);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: "No fields to update",
      });
    }

    // Add updated_at
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(courseId);

    const query = `
        UPDATE courses 
        SET ${updates.join(", ")} 
        WHERE id = $${paramIndex} 
        RETURNING *
      `;

    const result = await pool.query(query, values);

    res.json({
      success: true,
      course: result.rows[0],
    });
  } catch (error) {
    console.error("Update course error:", error);
    res.status(500).json({
      error: "Failed to update course",
    });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Get all course materials to delete from S3
    const materialsResult = await pool.query(
      "SELECT s3_key FROM course_materials WHERE course_id = $1",
      [courseId]
    );

    // Delete files from S3
    if (materialsResult.rows.length > 0) {
      const deleteParams = {
        Bucket: BUCKET_NAME,
        Delete: {
          Objects: materialsResult.rows.map((row) => ({ Key: row.s3_key })),
        },
      };

      await s3.deleteObjects(deleteParams).promise();
    }

    // Delete course (CASCADE will handle related records)
    const result = await pool.query(
      "DELETE FROM courses WHERE id = $1 RETURNING *",
      [courseId]
    );

    res.json({
      success: true,
      message: "Course and all associated materials deleted successfully",
      deletedCourse: result.rows[0],
    });
  } catch (error) {
    console.error("Delete course error:", error);
    res.status(500).json({
      error: "Failed to delete course",
    });
  }
};

const uploadCourseMaterials = async (req, res) => {
  try {
    const { courseId } = req.params;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        error: "No files uploaded",
      });
    }

    const uploadedMaterials = [];

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExtension = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExtension}`;
      const s3Key = `courses/${courseId}/materials/${fileName}`;

      // Upload to S3
      const uploadParams = {
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ServerSideEncryption: "AES256",
      };

      const s3Result = await s3.upload(uploadParams).promise();

      // Save to database
      const dbQuery = `
          INSERT INTO course_materials (
            course_id, file_name, file_type, file_size, 
            s3_key, s3_bucket, upload_order
          ) 
          VALUES ($1, $2, $3, $4, $5, $6, $7) 
          RETURNING *
        `;

      const dbValues = [
        courseId,
        file.originalname,
        file.mimetype,
        file.size,
        s3Key,
        BUCKET_NAME,
        i,
      ];

      const dbResult = await pool.query(dbQuery, dbValues);
      uploadedMaterials.push(dbResult.rows[0]);
    }

    res.status(201).json({
      success: true,
      message: `${files.length} file(s) uploaded successfully`,
      materials: uploadedMaterials,
    });
  } catch (error) {
    console.error("Upload materials error:", error);
    res.status(500).json({
      error: "Failed to upload materials",
      details: error.message,
    });
  }
};

const getCourseMaterials = async (req, res) => {
  try {
    const { courseId } = req.params;

    const query = `
        SELECT * FROM course_materials 
        WHERE course_id = $1 
        ORDER BY upload_order, created_at
      `; 

    const result = await pool.query(query, [courseId]);

    // Generate signed URLs for each material
    const materialsWithUrls = result.rows.map((material) => {
      const signedUrl = s3.getSignedUrl("getObject", {
        Bucket: material.s3_bucket,
        Key: material.s3_key,
        Expires: 3600, // 1 hour expiration
      });

      return {
        ...material,
        download_url: signedUrl,
        // Don't expose S3 details to client
        s3_key: undefined,
        s3_bucket: undefined,
      };
    });

    res.json({
      success: true,
      materials: materialsWithUrls,
    });
  } catch (error) {
    console.error("Get materials error:", error);
    res.status(500).json({
      error: "Failed to retrieve materials",
    });
  }
};

const deleteCourseMaterials = async (req, res) => {
  try {
    const { materialId } = req.params;

    // Get material info
    const materialResult = await pool.query(
      "SELECT * FROM course_materials WHERE id = $1",
      [materialId]
    );

    if (materialResult.rows.length === 0) {
      return res.status(404).json({
        error: "Material not found",
      });
    }

    const material = materialResult.rows[0];

    // Delete from S3
    await s3
      .deleteObject({
        Bucket: material.s3_bucket,
        Key: material.s3_key,
      })
      .promise();

    // Delete from database
    await pool.query("DELETE FROM course_materials WHERE id = $1", [
      materialId,
    ]);

    res.json({
      success: true,
      message: "Material deleted successfully",
    });
  } catch (error) {
    console.error("Delete material error:", error);
    res.status(500).json({
      error: "Failed to delete material",
    });
  }
};

const getInstructorCoursesOrStudentEnrollments = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query, queryParams;

    if (userRole === 'instructor') {
      // Get instructor's courses
      query = `
        SELECT c.*, COUNT(e.id) as enrolled_count
        FROM courses c
        LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'active'
        WHERE c.instructor_id = $1
        GROUP BY c.id
        ORDER BY c.created_at DESC
      `;
      queryParams = [userId];
    } else {
      // Get student's enrolled courses
      query = `
        SELECT c.*, u.first_name, u.last_name, e.enrollment_date, e.status as enrollment_status
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        JOIN users u ON c.instructor_id = u.id
        WHERE e.student_id = $1
        ORDER BY e.enrollment_date DESC
      `;
      queryParams = [userId];
    }

    const result = await pool.query(query, queryParams);

    res.json({
      success: true,
      courses: result.rows
    });

  } catch (error) {
    console.error('Get my courses error:', error);
    res.status(500).json({
      error: 'Failed to retrieve courses'
    });
  }
}

const checkEnrollmentStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Check if user is instructor of this course
    const courseResult = await pool.query(
      'SELECT instructor_id FROM courses WHERE id = $1',
      [courseId]
    );

    if (courseResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Course not found'
      });
    }

    const isInstructor = courseResult.rows[0].instructor_id === userId;

    if (isInstructor) {
      return res.json({
        success: true,
        hasAccess: true,
        isInstructor: true,
        enrollmentStatus: null
      });
    }

    // Check enrollment for students
    const enrollmentResult = await pool.query(
      'SELECT * FROM enrollments WHERE student_id = $1 AND course_id = $2',
      [userId, courseId]
    );

    const hasAccess = enrollmentResult.rows.length > 0 && 
                     enrollmentResult.rows[0].status === 'active';

    res.json({
      success: true,
      hasAccess,
      isInstructor: false,
      enrollmentStatus: enrollmentResult.rows.length > 0 ? 
                       enrollmentResult.rows[0].status : null
    });

  } catch (error) {
    console.error('Check enrollment error:', error);
    res.status(500).json({
      error: 'Failed to check enrollment status'
    });
  }
}


module.exports = {createCourse,getAllCourses,getCourseById,updateCourse,deleteCourse,getCourseMaterials, uploadCourseMaterials,deleteCourseMaterials,checkEnrollmentStatus,getInstructorCoursesOrStudentEnrollments}