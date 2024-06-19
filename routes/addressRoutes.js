const express = require("express");
const router = express.Router();
const addressController = require("../controllers/addressController");

// Add a new address
router.post("/add", addressController.addAddress);

// Delete an address
router.delete("/delete", addressController.deleteAddress);

// Edit an address
router.put("/edit", addressController.editAddress);

// View addresses
router.post("/view", addressController.viewAddresses);

module.exports = router;
