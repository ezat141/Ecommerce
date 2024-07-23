const { validationResult } = require('express-validator');
const Product = require('../models/Product');
const Category = require('../models/Category');
const httpStatusText = require("../utils/httpStatusText");
const cloudinary = require("../utils/cloudinary");
// const pipeline = require('../utils/pipeline');
const mongoose = require("mongoose");

const fs = require('fs');


exports.getAllProducts = async (req, res) => {
    // const query = req.query;
    // const limit = parseInt(query.limit) || 10;
    // const page = parseInt(query.page) || 1;
    // const skip = (page -1) * limit;
    try {
        const products = await Product.find({}, {"__v": false, "favorite": false});
        // await Product.find({}, {"__v": false}).limit(limit).skip(skip).exec();
        res.status(200).json({status: httpStatusText.SUCCESS, data: products});

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

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
    
        console.log('File received:', req.file);
        // Upload file to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path);
        console.log('Cloudinary upload result:', result);
    
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
        res.status(201).json({ status: httpStatusText.SUCCESS, data: newProduct });
        
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Internal server error' });
        
    }
};

exports.updateProduct = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { id, ...updateData } = req.body; // Extract id from req.body and the rest as updateData

    try {
        // If an image file is uploaded, upload it to Cloudinary
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            // Remove file from local storage
            fs.unlinkSync(req.file.path);
            // Add the Cloudinary image URL to updateData
            updateData.image = result.secure_url;
        }

        const product = await Product.findByIdAndUpdate(id, updateData, { new: true });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({status: httpStatusText.SUCCESS, data: product});
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.deleteProduct = async (req, res) =>{
    try {
        const { id } = req.body; // Get the product ID from req.body

        if (!id) {
            return res.status(400).json({ success: false, message: 'Product ID is required' });
        }

        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        const data = {
            success: httpStatusText.SUCCESS,
            message: "Deleted Successfull!",
        };
        res.status(200).json(data);
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }

};

