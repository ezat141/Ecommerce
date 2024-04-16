const express = require('express');
const router = express.Router();
const multer = require('multer');
const { validateProduct } = require('../middleware/validationMiddleware');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const productController = require('../controllers/productController');

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
    }
});

const upload = multer({storage: storage});

// Routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', authMiddleware, adminMiddleware, upload.single('image'), validateProduct, productController.createProduct);
router.put('/:id', authMiddleware, adminMiddleware, upload.single('image'), validateProduct, productController.updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, upload.single('image'), productController.deleteProduct);

module.exports = router;