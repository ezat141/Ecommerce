const { validationResult } = require('express-validator');
const Product = require('../models/Product');
const Category = require('../models/Category');
const httpStatusText = require("../utils/httpStatusText");
const cloudinary = require("../utils/cloudinary");
const asyncWrapper = require("../middleware/asyncWrapper");
const appError = require("../utils/appError");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const generateJWT = require("../utils/generateJWT");
const upload = require('../middleware/multer');
const fs = require('fs');






// Login user
exports.loginAdmin = asyncWrapper(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email && !password) {

        const error = appError.create(
        "email and password are required",
        400,
        httpStatusText.FAIL
    );
    return next(error);
    }
    const admin = await Admin.findOne({ admin_email: email });
    if (!admin) {
        const error = appError.create("admin not found", 400, httpStatusText.FAIL);
        return next(error);
    }


    const isMatch = await bcrypt.compare(password, admin.admin_password);
    if (!isMatch) {
        const error = appError.create("invalid password", 400, httpStatusText.FAIL);
        return next(error);
    }
    // generate JWT token
    const token = await generateJWT({

        adminId: admin._id,
    });
    res
    .status(200)
    .json({ status: httpStatusText.SUCCESS, data: { token, admin } });
});





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

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find({}, {"__v": false});
        res.status(200).json({status: httpStatusText.SUCCESS, data: categories});
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
        
    }
};

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

exports.updateCategory = async (req, res) => {
    const { category_name, category_name_ar, image } = req.body;

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

        const category = await Category.findByIdAndUpdate(id, updateData, { new: true });
        // const category = await Category.findByIdAndUpdate(
        //     req.params.id,
        //     { category_name, category_name_ar, image },
        //     { new: true }
        // );
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json({status: httpStatusText.SUCCESS, data: category});
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.deleteCategory = async (req, res) => {
    try {

        const { id } = req.body; // Get the product ID from req.body

        if (!id) {
            return res.status(400).json({ success: false, message: 'Category ID is required' });
        }
        const category = await Category.findByIdAndDelete(id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.status(200).json({ status: httpStatusText.SUCCESS, message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
