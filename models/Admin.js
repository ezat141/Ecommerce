const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    admin_id: {
        type: Number,
        required: true,
        unique: true,
        default: 1
    },
    admin_name: {
        type: String,
        required: true
    },
    admin_email: {
        type: String,
        unique: true,
        required: true
    },
    admin_password: {
        type: String,
        required: true
    },
    admin_phone: {
        type: String,
        unique: true,
        required: true
        // You can add any additional configuration for the phone field here
    },
    admin_verifycode: {
        type: String,
        // You can add any additional configuration for the verification code field here
    },
    admin_approve: {
        type: Boolean,
        default: false // Example default value
    },
    admin_role: {
        type: Number,
        enum: [0, 1], // 0: admin, 1: superadmin
        default: 0
    },
    // admin_create: {
    //     type: Date,
    //     default: Date.now
    // }

}, { timestamps: true });

// Auto increment delivery_id
adminSchema.pre('save', async function (next) {
    if (this.isNew) {
        const lastAdmin = await this.constructor.findOne().sort('-admin_id').exec();
        this.admin_id = lastAdmin ? lastAdmin.admin_id + 1 : 1;
    }
    next();
});

module.exports = mongoose.model('Admin', adminSchema);