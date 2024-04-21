// categoryController.js
const Category = require('../models/Category');
const { validationResult } = require('express-validator');



// Get all categories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
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
    const { category_name, category_name_ar, image } = req.body;
    const newCategory = new Category({
        category_name,
        category_name_ar,
        image: req.file ? req.file.path : null
    });
    try {
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
        
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

