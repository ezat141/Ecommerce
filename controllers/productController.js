const { validationResult } = require('express-validator');
const Product = require('../models/Product');
const cloudinary = require("../utils/cloudinary");
const fs = require('fs');



// Get all products
exports.getAllProducts = async (req, res) => {
    // const query = req.query;
    // const limit = parseInt(query.limit) || 10;
    // const page = parseInt(query.page) || 1;
    // const skip = (page -1) * limit;
    try {
        const products = await Product.find({}, {"__v": false});
        // await Product.find({}, {"__v": false}).limit(limit).skip(skip).exec();
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
    
    
    try {
        // Check if file is uploaded
        if (!req.file) {

            return res.status(400).json({ message: 'Image file is required' });
        }
    
        // Upload file to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path);
    
        // Remove file from local storage
        fs.unlinkSync(req.file.path);

        const { product_name, product_name_ar, product_desc,  product_desc_ar, image, product_count, product_price, product_discount, product_cat} = req.body;

        const newProduct = new Product({
            product_name,
            product_name_ar,
            product_desc,
            product_desc_ar,
            image: result.secure_url, // Use the Cloudinary image URL
            // image: req.file ? req.file.path : null,
            product_count,
            product_price,
            product_discount,
            product_cat
        });

        await newProduct.save();
        res.status(201).json({ status: 'success', data: newProduct });
        
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Internal server error' });
        
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