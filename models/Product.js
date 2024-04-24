const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    product_name: {
        type: String,
        required: true
    },
    product_name_ar: {
        type: String,
        required: true
    },
    product_desc: {
        type: String,
        required: true
    },
    product_desc_ar: {
        type: String,
        required: true
    },
    image: {
        type: String, // Path to the image file
    },
    product_count: {
        type: Number,
        required: true

    },
    product_active: {
        type: Boolean,
        default: true
    },
    product_price: {
        type: Number,
        required: true
    },
    product_discount: {
        type: Number,
    },
    product_date: {
        type: Date,
        default: Date.now
    },
    product_cat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    }
    
    
    
    // stock: {
    //     type: Number,
    //     required: true
    // },
    // category: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Category',
    //     required: true
    // }
});

module.exports = mongoose.model('Product', productSchema);