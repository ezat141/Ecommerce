const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String, // Path to the image file
    },
    
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