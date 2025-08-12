const express = require("express");
const multer = require("multer");

const {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  uploadCourseMaterials,
  getCourseMaterials,
  deleteCourseMaterials,
  checkEnrollmentStatus,
  getInstructorCoursesOrStudentEnrollments
} = require("../controllers/course");
const router = express.Router();

// Multer configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allowed file types
    const allowedTypes = [
      "application/pdf",
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "image/jpeg",
      "image/png",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only PDF, videos, images, and presentations allowed."
        )
      );
    }
  },
});

const requireInstructor = (req, res, next) => {
  if (req.user.role !== "instructor") {
    return res.status(403).json({
      error: "Forbidden: Only instructors can create courses",
    });
  }
  next();
};

router.post("/", requireInstructor, createCourse);
router.get("/", getAllCourses);
router.get("/:courseId", getCourseById);
router.put("/:courseId", requireInstructor, updateCourse);
router.delete("/:courseId", requireInstructor, deleteCourse);

router.post(
  "/:courseId/materials",
  upload.array("files", 10),
  requireInstructor,
  uploadCourseMaterials
);
router.get("/:courseId/materials", getCourseMaterials);
router.delete(
  "/:courseId/materials/:materialId",
  requireInstructor,
  deleteCourseMaterials
);

router.get("/:courseId/enrollment-status", checkEnrollmentStatus);
router.get("/courses", getInstructorCoursesOrStudentEnrollments);

module.exports = router;
