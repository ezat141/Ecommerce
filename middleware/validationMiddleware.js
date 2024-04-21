// middleware/validationMiddleware.js
const { body, validationResult } = require('express-validator');

exports.validateProduct = [
    body('product_name').trim().isLength({ min: 1 }).withMessage('Product name is required'),
    body('product_name_ar').trim().isLength({ min: 1 }).withMessage('Product name (Arabic) is required'),
    body('product_price').isNumeric().withMessage('Price must be a number'),
    body('product_desc').trim().isLength({ min: 1 }).withMessage('Description is required'),
    body('product_desc_ar').trim().isLength({ min: 1 }).withMessage('Description (Arabic) is required'),
    body('product_cat').trim().isLength({ min: 1 }).withMessage('Category is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

exports.validateCategory = [
    body('category_name').trim().isLength({ min: 1 }).withMessage('Category name is required'),
    body('category_name_ar').trim().isLength({ min: 1 }).withMessage('Category name (Arabic) is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];
