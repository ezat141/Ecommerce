const express = require('express');
const router = express.Router();
const httpStatusText = require("../utils/httpStatusText");
// const { getAllCategories } = require('../controllers/categoryController');
// const { getAllProducts } = require('../controllers/productController');
const Category = require('../models/Category');
const Product = require('../models/Product');

router.get('/home', async (req, res) => {
    try {
        const categories = await Category.find({}, {"__v": false});
        const products = await Product.find({ product_discount: { $ne: 0 } }, {"__v": false});
        const homeData = { categories, products };
        res.json({ status: httpStatusText.SUCCESS,  categories, products});
    } catch (error) {
                console.error('Error in /home route:', error); // Log the error to the console

        res.status(500).json({ status: httpStatusText.FAIL, message: 'Internal Server Error' });
    }
});

// router.get('/home', async (req, res) => {
//     try {
//         // Fetch all categories and products concurrently
//         const [categories, products] = await Promise.all([
//             Category.find(),
//             Product.find()
//         ]);

//         // Combine categories and products into a single array
//         const homeData = { categories, products };

//         // Send the combined data as the response
//         res.status(200).json(homeData);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }

// });


module.exports = router;
