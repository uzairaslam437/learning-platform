require("dotenv").config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const {pool} = require("../model/db");

// Handle successful payment
async function handleSuccessfulPayment(session) {
  console.log('Processing successful payment:', session.id);

  try {
    const { courseId, studentId, instructorId } = session.metadata;
    const paymentIntentId = session.payment_intent;

    // Start transaction
    await pool.query('BEGIN');

    // Update payment record
    const paymentUpdateResult = await pool.query(
      `UPDATE payments 
       SET status = $1, stripe_payment_intent_id = $2, completed_at = CURRENT_TIMESTAMP,
           metadata = jsonb_set(metadata, '{completedAt}', to_jsonb(CURRENT_TIMESTAMP::text))
       WHERE stripe_session_id = $3 
       RETURNING *`,
      ['completed', paymentIntentId, session.id]
    );

    if (paymentUpdateResult.rows.length === 0) {
      throw new Error('Payment record not found');
    }

    // Check if enrollment already exists (prevent duplicates)
    const existingEnrollment = await pool.query(
      'SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2',
      [studentId, courseId]
    );

    if (existingEnrollment.rows.length === 0) {
      // Create enrollment
      await pool.query(
        `INSERT INTO enrollments (student_id, course_id, enrollment_date, status) 
         VALUES ($1, $2, CURRENT_TIMESTAMP, 'active')`,
        [studentId, courseId]
      );

      console.log(`Student ${studentId} enrolled in course ${courseId}`);
    } else {
      // Update existing enrollment to active
      await pool.query(
        'UPDATE enrollments SET status = $1, enrollment_date = CURRENT_TIMESTAMP WHERE student_id = $2 AND course_id = $3',
        ['active', studentId, courseId]
      );

      console.log(`Student ${studentId} enrollment reactivated for course ${courseId}`);
    }

    // Commit transaction
    await pool.query('COMMIT');

    // Optional: Send confirmation email here
    // await sendEnrollmentConfirmationEmail(studentId, courseId);

    console.log('Payment processing completed successfully');

  } catch (error) {
    // Rollback transaction
    await pool.query('ROLLBACK');
    console.error('Error processing successful payment:', error);
    throw error;
  }
}

// Handle expired payment
async function handleExpiredPayment(session) {
  console.log('Processing expired payment:', session.id);

  try {
    await pool.query(
      `UPDATE payments 
       SET status = $1, 
           metadata = jsonb_set(metadata, '{expiredAt}', to_jsonb(CURRENT_TIMESTAMP::text))
       WHERE stripe_session_id = $2`,
      ['failed', session.id]
    );

    console.log('Payment marked as expired');
  } catch (error) {
    console.error('Error processing expired payment:', error);
    throw error;
  }
}

// Handle failed payment
async function handleFailedPayment(paymentIntent) {
  console.log('Processing failed payment:', paymentIntent.id);

  try {
    await pool.query(
      `UPDATE payments 
       SET status = $1,
           metadata = jsonb_set(metadata, '{failedAt}', to_jsonb(CURRENT_TIMESTAMP::text))
       WHERE stripe_payment_intent_id = $2`,
      ['failed', paymentIntent.id]
    );

    console.log('Payment marked as failed');
  } catch (error) {
    console.error('Error processing failed payment:', error);
    throw error;
  }
}

const createPaymentIntent = async (req, res) => {
  try {
    console.log("create payment intent:",req.body)
    const { courseId } = req.body;
    const studentId = req.user.id;

    // Validate required fields
    if (!courseId) {
      return res.status(400).json({
        error: 'Course ID is required'
      });
    }

    // Check if course exists and is published
    const courseResult = await pool.query(
      'SELECT * FROM courses WHERE id = $1 AND status = $2',
      [courseId, 'published']
    );

    if (courseResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Course not found or not available for purchase'
      });
    }

    const course = courseResult.rows[0];

    // Check if student is already enrolled
    const enrollmentResult = await pool.query(
      'SELECT * FROM enrollments WHERE student_id = $1 AND course_id = $2',
      [studentId, courseId]
    );

    if (enrollmentResult.rows.length > 0) {
      return res.status(400).json({
        error: 'You are already enrolled in this course',
        enrollmentStatus: enrollmentResult.rows[0].status
      });
    }

    // Check if student is trying to buy their own course (if they're also an instructor)
    if (course.instructor_id === studentId) {
      return res.status(400).json({
        error: 'You cannot purchase your own course'
      });
    }

    // Get student details for the session
    const studentResult = await pool.query(
      'SELECT email, first_name, last_name FROM users WHERE id = $1',
      [studentId]
    );

    const student = studentResult.rows[0];

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: course.currency.toLowerCase(),
            product_data: {
              name: course.title,
              description: course.description || 'Online Course',
              images: course.thumbnail_url ? [course.thumbnail_url] : [],
            },
            unit_amount: Math.round(course.price * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/courses/${courseId}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/courses/${courseId}?cancelled=true`,
      customer_email: student.email,
      client_reference_id: studentId, // Store student ID for webhook
      metadata: {
        courseId: courseId,
        studentId: studentId,
        courseName: course.title,
        instructorId: course.instructor_id
      },
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes
    });

    // Store payment session in database for tracking
    await pool.query(
      `INSERT INTO payments (
        student_id, course_id, stripe_session_id, 
        amount, currency, status, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        studentId,
        courseId,
        session.id,
        course.price,
        course.currency,
        'pending',
        JSON.stringify({
          sessionId: session.id,
          courseTitle: course.title,
          createdAt: new Date().toISOString()
        })
      ]
    );

    res.json({
      success: true,
      sessionId: session.id,
      checkoutUrl: session.url,
      sessionDetails: {
        courseId,
        courseName: course.title,
        amount: course.price,
        currency: course.currency,
        expiresAt: new Date((session.expires_at) * 1000).toISOString()
      }
    });

  } catch (error) {
    console.error('Payment session creation error:', error);
    
    if (error.type === 'StripeCardError') {
      res.status(400).json({
        error: 'Payment failed',
        details: error.message
      });
    } else {
      res.status(500).json({
        error: 'Failed to create payment session',
        details: error.message
      });
    }
  }
}

const webhookHandler =  async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleSuccessfulPayment(event.data.object);
        break;
      
      case 'checkout.session.expired':
        await handleExpiredPayment(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handleFailedPayment(event.data.object);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({received: true});

  } catch (error) {
    console.error('Webhook handling error:', error);
    res.status(500).json({
      error: 'Webhook processing failed',
      details: error.message
    });
  }
}

const getPaymentStatus =  async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    // Get payment record
    const paymentResult = await pool.query(
      `SELECT p.*, c.title as course_title 
       FROM payments p 
       JOIN courses c ON p.course_id = c.id 
       WHERE p.stripe_session_id = $1 AND p.student_id = $2`,
      [sessionId, userId]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Payment session not found'
      });
    }

    const payment = paymentResult.rows[0];

    // Get Stripe session details
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

    res.json({
      success: true,
      payment: {
        id: payment.id,
        courseId: payment.course_id,
        courseTitle: payment.course_title,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        createdAt: payment.created_at,
        completedAt: payment.completed_at
      },
      stripeSession: {
        id: stripeSession.id,
        paymentStatus: stripeSession.payment_status,
        customerEmail: stripeSession.customer_email
      }
    });

  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      error: 'Failed to retrieve payment status'
    });
  }
}

const verifyCourseAccess = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Check course exists
    const courseResult = await pool.query(
      'SELECT id, title, instructor_id FROM courses WHERE id = $1',
      [courseId]
    );

    if (courseResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Course not found'
      });
    }

    const course = courseResult.rows[0];

    // Check if user is the instructor
    if (course.instructor_id === userId) {
      return res.json({
        success: true,
        hasAccess: true,
        accessType: 'instructor',
        message: 'Access granted as course instructor'
      });
    }

    // Check enrollment status
    const enrollmentResult = await pool.query(
      `SELECT e.*, p.status as payment_status, p.completed_at as payment_date
       FROM enrollments e
       LEFT JOIN payments p ON e.student_id = p.student_id AND e.course_id = p.course_id
       WHERE e.student_id = $1 AND e.course_id = $2 AND p.status = $3`,
      [userId, courseId,"completed"]
    );

    if (enrollmentResult.rows.length === 0) {
      return res.json({
        success: true,
        hasAccess: false,
        accessType: 'none',
        message: 'Course not purchased'
      });
    }

    const enrollment = enrollmentResult.rows[0];

    res.json({
      success: true,
      hasAccess: enrollment.status === 'active',
      accessType: 'student',
      enrollmentDetails: {
        status: enrollment.status,
        enrollmentDate: enrollment.enrollment_date,
        paymentStatus: enrollment.payment_status,
        paymentDate: enrollment.payment_date
      }
    });

  } catch (error) {
    console.error('Verify access error:', error);
    res.status(500).json({
      error: 'Failed to verify course access'
    });
  }
}

module.exports = {createPaymentIntent,webhookHandler,getPaymentStatus,verifyCourseAccess}