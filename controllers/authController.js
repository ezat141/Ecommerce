const asyncWrapper = require("../middleware/asyncWrapper");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const generateJWT = require("../utils/generateJWT");
const httpStatusText = require("../utils/httpStatusText");
const appError = require("../utils/appError");
const nodemailer = require("nodemailer");

const User = require("../models/User");

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
    subject: "Verification Code", // Subject line
    text: `Your verification code is ${otp}.`, // Plain text body
    // HTML body if needed
  });

  console.log("Message sent: %s", info.messageId);
};

// Register a new user
exports.registerUser = asyncWrapper(async (req, res, next) => {
  const { username, email, password, phone } = req.body;

  // Generate OTP
  const otp = generateOTP();
  let oldUser = await User.findOne({ email: email });
  if (oldUser) {
    const error = appError.create(
      "user already exists",
      400,
      httpStatusText.FAIL
    );
    return next(error);
  }

  // password hashing
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    users_verifycode: otp,
    users_phone: phone,
  });
  await newUser.save();

  // Send OTP to the user's email
  try {
    await sendEmail(email, otp);
  } catch (error) {
    console.error("Error sending email:", error);
    // Handle email sending error
    return next(error);
  }

  // generate JWT token
  const token = await generateJWT({
    userId: newUser._id,
  });
  res.json({ status: httpStatusText.SUCCESS, data: { token } });
});

// Login user
exports.loginUser = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email && !password) {
    const error = appError.create(
      "email and password are required",
      400,
      httpStatusText.FAIL
    );
    return next(error);
  }
  const user = await User.findOne({ email });
  if (!user) {
    const error = appError.create("user not found", 400, httpStatusText.FAIL);
    return next(error);
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = appError.create("invalid password", 400, httpStatusText.FAIL);
    return next(error);
  }
  // generate JWT token
  const token = await generateJWT({
    userId: user._id,
  });
  res.status(200).json({ status: httpStatusText.SUCCESS, data: { token } });
});

exports.verifyCode = asyncWrapper(async (req, res, next) => {
  const { email, verifyCode } = req.body;

  // Find the user by email
  const user = await User.findOne({ email });

  // If user not found, return error
  if (!user) {
    const error = appError.create("User not found", 404, httpStatusText.FAIL);
    return next(error);
  }

  // Check if the provided OTP matches the one stored in the database
  if (user.users_verifycode !== verifyCode) {
    const error = appError.create(
      "Invalid verification code",
      400,
      httpStatusText.FAIL
    );
    return next(error);
  }

  // Update users_approve field to 1
  user.users_approve = true;

  // Save the updated user
  await user.save();

  // Respond with success message
  res.json({ status: httpStatusText.SUCCESS , message: "Verification successful" });
});
