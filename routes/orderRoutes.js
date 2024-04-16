const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { authMiddleware } = require("../middleware/authMiddleware");
router.post("/", authMiddleware, orderController.createOrder);
router.get("/", authMiddleware, orderController.getOrderHistory);
router.get("/:id", authMiddleware, orderController.getOrderById);
router.put("/:id", authMiddleware, orderController.updateOrderStatus);
router.delete("/:id", authMiddleware, orderController.deleteOrder); // No adminMiddleware needed here

module.exports = router;
