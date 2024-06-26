const express = require('express');
const router = express.Router();
const httpStatusText = require("../utils/httpStatusText");
// const { getAllCategories } = require('../controllers/categoryController');
// const { getAllProducts } = require('../controllers/productController');
const Category = require('../models/Category');
const Product = require('../models/Product');
const pipeline = require('../utils/pipeline');


// router.get('/home', async (req, res) => {
//     try {
//         const categories = await Category.find({}, {"__v": false});
//         const products = await Product.find({ product_discount: { $ne: 0 } }, {"__v": false});
//         const homeData = { categories, products };
//         res.json({ status: httpStatusText.SUCCESS,  categories, products});
//     } catch (error) {
//                 console.error('Error in /home route:', error); // Log the error to the console

//         res.status(500).json({ status: httpStatusText.FAIL, message: 'Internal Server Error' });
//     }
// });

// router.get('/home', async (req, res) => {
//     try {
//         const categories = await Category.find({}, {"__v": false});
//         const products = await Product.find({ product_discount: { $ne: 0 } }, {
//             "product_name": 1,
//             "product_name_ar": 1,
//             "product_desc": 1,
//             "product_desc_ar": 1,
//             "image": 1,
//             "product_count": 1,
//             "product_active": 1,
//             "product_price": 1,
//             "product_discount": 1,
//             "product_date": 1,
//             "product_cat": 1
//         });

//         // Iterate over each product and add additional fields from the corresponding category
//         const productsWithCategory = products.map(product => {
//             const category = categories.find(cat => cat._id.toString() === product.product_cat.toString());
//             return {
//                 ...product.toObject(),
//                 category_name: category.category_name,
//                 category_name_ar: category.category_name_ar,
//                 category_image: category.image,
//                 category_datetime: category.category_datetime
//             };
//         });

//         // const homeData = { categories, products: productsWithCategory };
//         res.json({ status: httpStatusText.SUCCESS, categories, products: productsWithCategory });
//     } catch (error) {
//         console.error('Error in /home route:', error);
//         res.status(500).json({ status: httpStatusText.FAIL, message: 'Internal Server Error' });
//     }
// });
router.get('/home', async (req, res) => {
    try {
        const categories = await Category.find({}, {"__v": false});
        const productsWithCategory = await Product.aggregate(pipeline);


        res.json({ status: httpStatusText.SUCCESS, categories, products: productsWithCategory });
    } catch (error) {
        console.error('Error in /home route:', error);
        res.status(500).json({ status: httpStatusText.FAIL, message: 'Internal Server Error' });
    }
});



module.exports = router;
