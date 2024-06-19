const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    address_usersid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    address_name: {
        type: String,
        required: true
    },
    address_city: {
        type: String,
        required: true
    },
    address_street: {
        type: String,
        required: true
    },
    address_lat: {
        type: Number,
        required: true
    },
    address_long: {
        type: Number,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Address', addressSchema);
