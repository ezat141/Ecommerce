const asyncWrapper = require("../middleware/asyncWrapper");
const appError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");
const generateJWT = require("../utils/generateJWT");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const Delivery = require("../models/Delivery");


// const generateOTP = () => {
//     return Math.floor(10000 + Math.random() * 90000);
// }

// const sendEmail = async (email, otp) =>{
//       // Create a Nodemailer transporter
//     let transporter = nodemailer.createTransport({
//         service: "Gmail",
//         auth: {
//             user: process.env.USER_EMAIL,
//             pass: process.env.USER_PASS,
//         },
//     });

//     let info = await transporter.sendMail({
//         from: process.env.USER_EMAIL,
//         to: email,
//         subject: "Verification Code",
//         text: `Your verification code is ${otp}.`,
//     });

//     console.log("Message sent: %s", info.messageId);

// };


// Login user
exports.loginDelivery = asyncWrapper(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email && !password) {

        const error = appError.create(
        "email and password are required",
        400,
        httpStatusText.FAIL
    );
    return next(error);
    }
    const delivery = await Delivery.findOne({ delivery_email: email });
    if (!delivery) {
        const error = appError.create("delivery not found", 400, httpStatusText.FAIL);
        return next(error);
    }
    // Check if the user is approved
    // if (!user.users_approve) {
    //   const error = appError.create(
    //     "Your account has not been approved yet",
    //     400,
    //     httpStatusText.FAIL
    //   );
    //   return next(error);
    // }

    const isMatch = await bcrypt.compare(password, delivery.delivery_password);
    if (!isMatch) {
        const error = appError.create("invalid password", 400, httpStatusText.FAIL);
        return next(error);
    }
    // generate JWT token
    const token = await generateJWT({

        deliveryId: delivery._id,
    });
    res
    .status(200)
    .json({ status: httpStatusText.SUCCESS, data: { token, delivery } });
});


// exports.verifyCode = asyncWrapper(async (req, res, next) => {
//     const { email, verifyCode } = req.body;

//     // Find the Delivery by email
//     const delivery = await Delivery.findOne({ delivery_email: email });

//     // If user not found, return error
//     if (!delivery) {
//         const error = appError.create("Delivery not found", 404, httpStatusText.FAIL);
//         return next(error);
//     }

//     // Check if the provided OTP matches the one stored in the database
//     if (delivery.delivery_verifycode !== verifyCode) {
//         const error = appError.create(
//         "Invalid verification code",
//         400,
//         httpStatusText.FAIL
//         );
//         return next(error);
//     }

//     // Update users_approve field to 1
//     delivery.delivery_approve = true;

//     // Save the updated user
//     await delivery.save();

//     // Respond with success message
//     res.json({
//         status: httpStatusText.SUCCESS,
//         message: "Verification successful",
//     });
// });

// exports.resendverifycodesignup = asyncWrapper(async (req, res, next) => {
//     const { email } = req.body;
//     const delivery = await Delivery.findOne({ delivery_email: email });
//     if (!delivery) {
//         const error = appError.create("Delivery not found", 404, httpStatusText.FAIL);
//         return next(error);
//     }
//     // Generate a new OTP
//     const otp = generateOTP();
//     // Update the delivery's verification code
//     delivery.delivery_verifycode = otp;
//     await delivery.save();
//     // Send OTP to the delivery's email
//     try {

//         await sendEmail(email, otp);
//     } catch (error) {
//         console.error("Error sending email:", error);
//       // Handle email sending error
//         return next(error);
//     }

//     res.json({
//         status: httpStatusText.SUCCESS,
//         message: "New verification code sent successfully",
//     });
// });

