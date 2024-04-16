const { validationResult } = require('express-validator');
const Product = require('../models/Product');


// Get all products
exports.getAllProducts = async (req, res) => {
    const query = req.query;
    const limit = parseInt(query.limit) || 10;
    const page = parseInt(query.page) || 1;
    const skip = (page -1) * limit;
    try {
        const products = await Product.find({}, {"__v": false}).limit(limit).skip(skip).exec();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Get a single product by ID
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Create a new product (admin only)
// Create a new product
exports.createProduct = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    const product = new Product({
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        image: req.file ? req.file.path : null
    });
    try {
        const newProduct = await product.save();
        res.status(201).json(newProduct);
        
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
        
    }
};

// Update a product
exports.updateProduct = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Delete a product
exports.deleteProduct = async (req, res) =>{
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        const data = {
            success: true,
            message: "Deleted Successfull!",
        };
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }

};