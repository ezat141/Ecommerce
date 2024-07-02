const { validationResult } = require('express-validator');
const Product = require('../models/Product');
const Favorite = require('../models/favorite');
const Category = require('../models/Category');
const httpStatusText = require("../utils/httpStatusText");
const cloudinary = require("../utils/cloudinary");
// const pipeline = require('../utils/pipeline');
const mongoose = require("mongoose");

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

// Controller function to get products by category ID
// exports.getProductsByCategory = async (req, res) => {
//     try {
//         const { category_id } = req.body; // Assuming category_id is passed in the request body
        
//         // Fetch products filtered by the provided category ID
//         const data = await Product.find({ product_cat: category_id }, {"__v": false});
        
//         res.status(200).json({status: httpStatusText.SUCCESS, data} );
//     } catch (error) {
//         console.error('Error fetching products by category:', error);
//         res.status(500).json({ success: false, message: 'Internal Server Error' });
//     }
// };

exports.getProductsByCategory = async (req, res) => {
    try {
        const { category_id, user_id } = req.body; // Assuming category_id and user_id are passed in the request body
        
        // Fetch favorite products of the user
        const favorites = await Favorite.find({ favorite_usersid: user_id }, { favorite_productsid: 1 });
        
        // Extract the favorite product IDs from the favorites array
        const favoriteProductIds = favorites.map(fav => fav.favorite_productsid.toString());
        console.log('Favorite Product IDs:', favoriteProductIds); // Log the favorite product IDs for debugging


        // Fetch products filtered by the provided category ID
        const products = await Product.find({ product_cat: category_id }, {"__v": false});
        
        // Iterate over the products and mark them as favorite if they exist in the user's favorites
        const productsWithFavorite = products.map(product => {
            const isFavorite = favoriteProductIds.includes(product._id.toString());
            console.log(`Product ${product._id}: Favorite - ${isFavorite}`);


            return {
                ...product.toObject(),
                favorite: isFavorite
            };
        });
        
        res.status(200).json({status: httpStatusText.SUCCESS, data: productsWithFavorite});
    } catch (error) {
        console.error('Error fetching products by category:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.getOffers = async (req, res) => {
    try {
        const products = await Product.find({ product_discount: { $ne: 0 } });

        res.status(200).json({ status: httpStatusText.SUCCESS, data: products });
    } catch (error) {
        res.status(500).json({ status: httpStatusText.FAIL, message: error.message });
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

exports.searchProducts = async (req, res) => {
    try {
        const { query } = req.body; // Assuming the search query is passed in the request body
        
        if (!query) {
            return res.status(400).json({
                status: httpStatusText.FAIL,
                message: 'Search query is required'
            });
        }

        // Perform the search
        const products = await Product.find({
            $or: [
                { product_name: { $regex: query, $options: 'i' } },
                { product_name_ar: { $regex: query, $options: 'i' } }
            ]
        }, { "__v": false });

        res.status(200).json({
            status: httpStatusText.SUCCESS,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            status: httpStatusText.FAIL,
            message: error.message
        });
    }
};