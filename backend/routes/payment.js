const express = require("express")
const router  = express.Router()
const {createPaymentIntent,webhookHandler,getPaymentStatus,verifyCourseAccess} = require("../controllers/payment");

const requireStudent = (req, res, next) => {
  if (req.user.role !== "student") {
    return res.status(403).json({
      error: "Forbidden: Only students can create payments",
    });
  }
  next();
};

 

router.post("/create-checkout-session",requireStudent,createPaymentIntent);
router.post('/stripe-webhook',webhookHandler);

router.get('/payment-status/:sessionId',getPaymentStatus);
router.get('/verify-access/:courseId',verifyCourseAccess);

module.exports = router;