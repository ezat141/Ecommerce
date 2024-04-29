const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');

// Endpoint to add a product to favorites
router.post('/favorites', favoriteController.addToFavorites);

module.exports = router;
