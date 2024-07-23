const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { validateProduct } = require('../middleware/validationMiddleware');
const upload = require('../middleware/multer');



router.get('/', adminController.getAllProducts);
router.put("/updateProduct", upload.single('image'), validateProduct, adminController.updateProduct);

router.post('/createProduct', upload.single('image'), validateProduct, adminController.createProduct);

router.delete("/deleteProduct", adminController.deleteProduct);


module.exports = router