const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/verify-code", authController.verifyCode);
router.post("/resend-verify-code", authController.resendverifycodesignup);
module.exports = router;
