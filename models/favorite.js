const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    favorite_usersid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming you have a User model
        required: true
    },
    favorite_productsid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Assuming you have a Product model
        required: true
    }
});

module.exports = mongoose.model('Favorite', favoriteSchema);
