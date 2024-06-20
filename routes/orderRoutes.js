const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate } = require('../middleware/authenticate');

// Checkout
router.post('/checkout', orderController.checkout);

module.exports = router;
