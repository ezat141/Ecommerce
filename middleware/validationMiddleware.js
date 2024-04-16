// middleware/validationMiddleware.js
const { body, validationResult } = require('express-validator');

exports.validateProduct = [
    body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];
