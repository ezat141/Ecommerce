const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");

// Route to get the cart for a user
router.post("/getCart", cartController.getCart);

// Route to add a product to the cart
router.post("/addToCart", cartController.addToCart);

// Route to remove a product from the cart
router.post("/removeCartItem", cartController.removeCartItem);

// Route to get the count of a specific product in the cart
router.post("/getCountItems", cartController.getCountItems);

module.exports = router;
