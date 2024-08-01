const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { validateProduct, validateCategory } = require('../middleware/validationMiddleware');
const upload = require('../middleware/multer');


// Login Admin
router.post("/login", adminController.loginAdmin);

// Product Routes
router.get('/getProducts', adminController.getAllProducts);
router.put("/updateProduct", validateProduct, adminController.updateProduct);

// router.post('/createProduct', upload.single('image'), validateProduct, adminController.createProduct);
router.post('/createProduct', validateProduct, adminController.createProduct);


router.delete("/deleteProduct", adminController.deleteProduct);

// Category Routes
router.get('/getCategories', adminController.getAllCategories);

// router.post('/createCategory', upload.single('image'), validateCategory,adminController.createCategory);
router.post('/createCategory', validateCategory,adminController.createCategory);

// router.put('/updateCategory', upload.single('image'), validateCategory, adminController.updateCategory);
router.put('/updateCategory', validateCategory, adminController.updateCategory);

router.delete('/deleteCategory', upload.single('image'), adminController.deleteCategory);

// Order Routes
router.get('/ordersPending', adminController.viewPending);
router.get('/ordersAccepted', adminController.viewAccepted);
router.post("/ordersDetailsView", adminController.ordersDetailsView);
router.post('/ordersPrepared', adminController.preparedOrder);
router.post('/ordersApprove', adminController.adminApprove);
router.get('/ordersArchive', adminController.archiveOrders);

module.exports = router