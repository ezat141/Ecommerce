const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
// Checkout
router.post("/checkout", orderController.checkout);

router.post("/getOrders", orderController.viewOrders);

router.post("/ordersDetailsView", orderController.ordersDetailsView);

router.post("/deleteOrder", orderController.deleteOrders);

router.post("/archiveOrder", orderController.archiveOrders);
router.post("/rateOrder", orderController.rateOrder);



module.exports = router;
