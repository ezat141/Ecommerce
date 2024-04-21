// models/Category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    category_name: {
        type: String,
        required: true
    },
    category_name_ar: {
        type: String,
        required: true
    },
    image: {
        type: String, // Path to the image file
        required: true
    },
    category_datetime: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Category', categorySchema);
