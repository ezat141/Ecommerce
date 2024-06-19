const express = require("express");
const router = express.Router();
const couponController = require("../controllers/couponController");
// const { authenticate } = require('../middleware/authenticate');

// Check coupon
router.post("/check", couponController.checkCoupon);

module.exports = router;
