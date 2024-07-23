const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { validateProduct } = require('../middleware/validationMiddleware');
const upload = require('../middleware/multer');



router.get('/', adminController.getAllProducts);
router.post("/updateProduct", upload.single('image'), validateProduct, adminController.updateProduct);

router.post('/createProduct', upload.single('image'), validateProduct, adminController.createProduct);

router.post("/deleteProduct", adminController.deleteProduct);


module.exports = router