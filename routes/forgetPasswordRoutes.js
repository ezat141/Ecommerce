const express = require("express");
const router = express.Router();
const forgetPasswordController = require("../controllers/forgetPasswordController");

// Forget Password Routes
router.post("/checkEmail", forgetPasswordController.checkEmail);
router.post("/verifyCode", forgetPasswordController.verifyCode);
router.post("/resetPassword", forgetPasswordController.resetPassword);

module.exports = router;
