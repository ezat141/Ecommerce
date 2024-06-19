const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    coupon_name: {
        type: String,
        required: true,
        unique: true
    },
    coupon_count: {
        type: Number,
        required: true
    },
    coupon_discount: {
        type: Number,
        required: true
    },
    coupon_expiredate: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model('Coupon', couponSchema);
