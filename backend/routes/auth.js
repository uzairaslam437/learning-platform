const express = require("express");
const router = express.Router();
const {signIn,signUp,refreshAccessToken,verifyAccessTokenHandler} = require("../controllers/auth");
const {verifyAccessToken} = require("../middlewares/verifyToken");

router.post("/register", signUp);
router.post("/login", signIn);
router.post("/refresh-access-token",verifyAccessToken, refreshAccessToken);
router.post("/verify-access-token", verifyAccessToken, verifyAccessTokenHandler);

module.exports = router;