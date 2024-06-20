const Coupon = require('../models/couponModel');
const httpStatusText = require("../utils/httpStatusText");

exports.checkCoupon = async (req, res) => {
    try {
        const { coupon_name } = req.body;

        // Find the coupon by name
        const coupon = await Coupon.findOne({ coupon_name });

        // Check if the coupon exists
        if (!coupon) {
            return res.status(404).json({ status: httpStatusText.FAIL, message: 'Coupon not found' });
        }

        const dateNow = new Date();

        // Check if the coupon is expired or out of stock
        if (coupon.coupon_expiredate <= dateNow) {
            return res.status(400).json({ status: httpStatusText.FAIL, message: 'Coupon has expired' });
        }

        if (coupon.coupon_count <= 0) {
            return res.status(400).json({ status: httpStatusText.FAIL, message: 'Coupon is out of stock' });
        }

        // Coupon is valid
        res.status(200).json({
            status: httpStatusText.SUCCESS,
            data: {
                coupon_name: coupon.coupon_name,
                coupon_discount: coupon.coupon_discount,
                coupon_expiredate: coupon.coupon_expiredate
            }
        });
    } catch (error) {
        res.status(500).json({ status: httpStatusText.FAIL, message: error.message });
    }
};

// Insert Coupon endpoint
exports.insertCoupon = async (req, res) => {
    const { coupon_name, coupon_count, coupon_discount, coupon_expiredate } = req.body;

    try {
        const newCoupon = new Coupon({
            coupon_name,
            coupon_count,
            coupon_discount,
            coupon_expiredate
        });

        const savedCoupon = await newCoupon.save();
        res.status(201).json({ status: httpStatusText.SUCCESS, data: savedCoupon });
    } catch (error) {
        res.status(500).json({ status: httpStatusText.FAIL, message: error.message });
    }
};
