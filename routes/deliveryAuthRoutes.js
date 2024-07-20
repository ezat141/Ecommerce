const express = require('express');
const router = express.Router();
const deliveryAuthController = require('../controllers/deliveryAuthController');

router.post("/login", deliveryAuthController.loginDelivery);
module.exports = router;
