const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orders_id: {
        type: Number,
        required: true,
        unique: true,
        default: 1
    },
    orders_usersid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orders_addressid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
        required: true
    },
    orders_type: {
        type: Number,
        enum: [0, 1], // 0: delivery, 1: receive
        required: true
    },
    orders_pricedelivery: {
        type: Number,
        default: 0
    },
    orders_price: {
        type: Number,
        required: true
    },
    orders_totalprice: {
        type: Number,
        required: true
    },
    orders_couponid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon'
    },
    orders_rating: {
        type: Number,
        default: 0
    },
    orders_noterating: {
        type: String,
        default: 'none'
    },
    orders_paymeentmethod: {
        type: Number,
        enum: [0, 1], // 0: cash, 1: payment card
        required: true
    },
    orders_status: {
        type: Number,
        default: 0 // Default status
    },
    orders_datetime: {
        type: Date,
        default: Date.now
    }
});

// Auto increment orders_id
orderSchema.pre('save', async function (next) {
    if (this.isNew) {
        const lastOrder = await this.constructor.findOne().sort('-orders_id').exec();
        this.orders_id = lastOrder ? lastOrder.orders_id + 1 : 1;
    }
    next();
});

module.exports = mongoose.model('Order', orderSchema);
