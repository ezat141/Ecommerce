const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');

// Endpoint to add a product to favorites
router.post('/add', favoriteController.addToFavorites);

// Route to remove a product from favorites
router.post('/remove', favoriteController.removeFromFavorites);
router.post('/removeFromFavorites', favoriteController.remove);


router.post('/getFavoritesWithDetails', favoriteController.getFavoritesWithDetails);

module.exports = router;
