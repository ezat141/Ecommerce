const express = require("express");
const router = express.Router();
const deliveryController = require("../controllers/deliveryController");



router.post("/deliveryApprove", deliveryController.deliveryApprove);
router.get("/deliveryPending", deliveryController.deliveryPending);
router.post("/deliveryAccepted", deliveryController.deliveryAccepted);
router.post("/deliveryDone", deliveryController.deliveryDone);
router.post("/deliveryArchive", deliveryController.deliveryArchive);


module.exports = router;

