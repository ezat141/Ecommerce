const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
// Checkout
router.post("/checkout", orderController.checkout);

router.post("/getOrders", orderController.viewOrders);

module.exports = router;
