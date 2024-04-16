const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    users_phone: {
        type: String,
        unique: true,
        // You can add any additional configuration for the phone field here
    },
    users_verifycode: {
        type: String,
        // You can add any additional configuration for the verification code field here
    },
    users_approve: {
        type: Boolean,
        default: false // Example default value
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
}, {timestamps: true});

module.exports = mongoose.model('User', userSchema);