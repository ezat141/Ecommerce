const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { validateProduct, validateCategory } = require('../middleware/validationMiddleware');
const upload = require('../middleware/multer');



router.post("/login", adminController.loginAdmin);

router.get('/getProducts', adminController.getAllProducts);
router.put("/updateProduct", upload.single('image'), validateProduct, adminController.updateProduct);

router.post('/createProduct', upload.single('image'), validateProduct, adminController.createProduct);

router.delete("/deleteProduct", adminController.deleteProduct);

router.get('/getCategories', adminController.getAllCategories);

router.post('/createCategory', upload.single('image'), validateCategory,adminController.createCategory);
// router.post('/createCategory', validateCategory,adminController.createCategory);

router.put('/updateCategory', upload.single('image'), validateCategory, adminController.updateCategory);
router.delete('/deleteCategory', upload.single('image'), adminController.deleteCategory);


module.exports = router