const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
    delivery_id: {
        type: Number,
        required: true,
        unique: true,
        default: 1
    },
    delivery_name: {
        type: String,
        required: true
    },
    delivery_email: {
        type: String,
        unique: true,
        required: true
    },
    delivery_password: {
        type: String,
        required: true
    },
    delivery_phone: {
        type: String,
        unique: true,
        required: true
        // You can add any additional configuration for the phone field here
    },
    delivery_verifycode: {
        type: String,
        // You can add any additional configuration for the verification code field here
    },
    delivery_approve: {
        type: Boolean,
        default: false // Example default value
    },

}, { timestamps: true });

// Auto increment delivery_id
deliverySchema.pre('save', async function (next) {
    if (this.isNew) {
        const lastDelivery = await this.constructor.findOne().sort('-delivery_id').exec();
        this.delivery_id = lastDelivery ? lastDelivery.delivery_id + 1 : 1;
    }
    next();
});

module.exports = mongoose.model('Delivery', deliverySchema);