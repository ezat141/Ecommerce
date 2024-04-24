// categoryController.js
const Category = require('../models/Category');
const { validationResult } = require('express-validator');
const cloudinary = require("../utils/cloudinary");
const fs = require('fs');



// Get all categories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find({}, {"__v": false});
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
        
    }
};

// Get a single category by ID
exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// Create a new category
exports.createCategory = async (req, res) => {
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
    
        // Create category with Cloudinary image URL
        const { category_name, category_name_ar } = req.body;
        const newCategory = new Category({

            category_name,
            category_name_ar,
            image: result.secure_url // Use the Cloudinary image URL
        });
    
        // Save category to database
        await newCategory.save();
    
        // Return success response
        res.status(201).json({ status: 'success', data: newCategory });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update an existing category by ID
exports.updateCategory = async (req, res) => {
    const { category_name, category_name_ar, image } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { category_name, category_name_ar, image },
            { new: true }
        );
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Delete a category by ID
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

