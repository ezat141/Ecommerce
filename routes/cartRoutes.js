const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authMiddleware } = require('../middleware/authMiddleware');


// Get the user's cart
router.get('/', authMiddleware, cartController.getCart);

// Add an item to the cart
router.post('/', authMiddleware, cartController.addToCart);

// Update an item in the cart
router.put('/', authMiddleware, cartController.updateCartItem);

// Remove an item from the cart
router.delete('/:productId', authMiddleware, cartController.removeCartItem);


module.exports = router;