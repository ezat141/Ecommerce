// categoryRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { validateCategory } = require('../middleware/validationMiddleware');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const categoryController = require('../controllers/categoryController');


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

// Define routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.post('/', authMiddleware, adminMiddleware, upload.single('image'), validateCategory,categoryController.createCategory);
router.put('/:id', authMiddleware, adminMiddleware, upload.single('image'), validateCategory, categoryController.updateCategory);
router.delete('/:id', authMiddleware, adminMiddleware, upload.single('image'), categoryController.deleteCategory);



module.exports = router;
