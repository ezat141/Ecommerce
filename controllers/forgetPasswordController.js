const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const asyncWrapper = require("../middleware/asyncWrapper");
const appError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");

// Function to generate a random 5-digit OTP
const generateOTP = () => {
  return Math.floor(10000 + Math.random() * 90000);
};

// Function to send email using nodemailer
const sendEmail = async (email, otp) => {
  // Create a Nodemailer transporter
  let transporter = nodemailer.createTransport({
    // Configure your email service provider details here
    // For example, for Gmail:
    service: "Gmail",
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.USER_PASS,
    },
  });

  // Send mail with defined transport object
  let info = await transporter.sendMail({
    from: process.env.USER_EMAIL, // Sender address
    to: email, // List of receivers
    subject: "Password Reset OTP", // Subject line
    text: `Password Reset OTP ${otp}.`, // Plain text body
    // HTML body if needed
  });

  console.log("Message sent: %s", info.messageId);
};

// Check email and send OTP for password reset
exports.checkEmail = asyncWrapper(async (req, res, next) => {
  const { email } = req.body;

  // Generate OTP
  const otp = generateOTP();

  // Find the user by email
  const user = await User.findOne({ email });

  // If user not found, return error
  if (!user) {
    const error = appError.create(
      "User not found",
      404,
      httpStatusText.NOT_FOUND
    );
    return next(error);
  }

  // Update users_verifycode field with the new OTP
  user.users_verifycode = otp;
  await user.save();

  // Send OTP to the user's email
  try {
    await sendEmail(email, otp);
  } catch (error) {
    console.error("Error sending email:", error);
    // Handle email sending error
    return next(error);
  }

  // Respond with success message
  res.json({
    status: httpStatusText.SUCCESS,
    message: "OTP sent to email for password reset",
  });
});

// Verify OTP for password reset
exports.verifyCode = asyncWrapper(async (req, res, next) => {
  const { email, verifyCode } = req.body;

  // Find the user by email
  const user = await User.findOne({ email });

  // If user not found, return error
  if (!user) {
    const error = appError.create(
      "User not found",
      404,
      httpStatusText.NOT_FOUND
    );
    return next(error);
  }

  // Check if the provided OTP matches the one stored in the database
  if (user.users_verifycode !== verifyCode) {
    const error = appError.create(
      "Invalid verification code",
      400,
      httpStatusText.BAD_REQUEST
    );
    return next(error);
  }

  // Respond with success message
  res.json({
    status: httpStatusText.SUCCESS,
    message: "Verification successful",
  });
});

// Reset password
exports.resetPassword = asyncWrapper(async (req, res, next) => {
  const { email, newPassword } = req.body;

  // Find the user by email
  const user = await User.findOne({ email });

  // If user not found, return error
  if (!user) {
    const error = appError.create(
      "User not found",
      404,
      httpStatusText.NOT_FOUND
    );
    return next(error);
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update the user's password
  user.password = hashedPassword;
  await user.save();

  // Respond with success message
  res.json({
    status: httpStatusText.SUCCESS,
    message: "Password reset successful",
  });
});
