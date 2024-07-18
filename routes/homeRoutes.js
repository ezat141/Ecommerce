const express = require('express');
const router = express.Router();
const httpStatusText = require("../utils/httpStatusText");
// const { getAllCategories } = require('../controllers/categoryController');
// const { getAllProducts } = require('../controllers/productController');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Cart = require('../models/cartModel');
const Settings = require('../models/Settings');

const pipeline = require('../utils/pipeline');


//////////////////////////////////////////////////////////////////
// router.get('/home', async (req, res) => {
//     try {
//         const categories = await Category.find({}, {"__v": false});
//         const productsWithCategory = await Product.aggregate(pipeline);


//         res.json({ status: httpStatusText.SUCCESS, categories, products: productsWithCategory });
//     } catch (error) {
//         console.error('Error in /home route:', error);
//         res.status(500).json({ status: httpStatusText.FAIL, message: 'Internal Server Error' });
//     }
// });

router.get('/home', async (req, res) => {
    try {
        // Fetch categories
        const categories = await Category.find({}, { "__v": false });

        // Fetch top-selling products
        const carts = await Cart.find({ 'items.cart_orders': { $ne: 0 } })
            .populate('items.product')
            .exec();

        // Count items and format response
        const productMap = new Map();
        carts.forEach(cart => {
            cart.items.forEach(item => {
                if(item.cart_orders !== 0){
                    const product = item.product;
                    if(product) {
                        const count = productMap.get(product._id) || { count: 0, product: product };
                        count.count += item.quantity;
                        productMap.set(product._id, count); //Update the Map
                    }
                }
                
            });
        });
        // Sample Data
        // Cart 1:
        // Item 1: Product ID 101, Quantity 2
        // Item 2: Product ID 102, Quantity 1
        // Cart 2:
        // Item 1: Product ID 101, Quantity 3
        // Item 2: Product ID 103, Quantity 4
        // Cart 3:
        // Item 1: Product ID 102, Quantity 2
        // Item 2: Product ID 103, Quantity 1
        // Step-by-Step Simulation
        // Initial State:

        // productMap = new Map()
        // Processing Cart 1:

        // Item 1: Product ID 101, Quantity 2
        // productMap.get(101): Not found, so { count: 0, product: Product(101) }
        // Increment count: count.count = 0 + 2 = 2
        // productMap.set(101, { count: 2, product: Product(101) })
        // Item 2: Product ID 102, Quantity 1
        // productMap.get(102): Not found, so { count: 0, product: Product(102) }
        // Increment count: count.count = 0 + 1 = 1
        // productMap.set(102, { count: 1, product: Product(102) })
        // Processing Cart 2:

        // Item 1: Product ID 101, Quantity 3
        // productMap.get(101): Found, { count: 2, product: Product(101) }
        // Increment count: count.count = 2 + 3 = 5
        // productMap.set(101, { count: 5, product: Product(101) })
        // Item 2: Product ID 103, Quantity 4
        // productMap.get(103): Not found, so { count: 0, product: Product(103) }
        // Increment count: count.count = 0 + 4 = 4
        // productMap.set(103, { count: 4, product: Product(103) })
        // Processing Cart 3:

        // Item 1: Product ID 102, Quantity 2
        // productMap.get(102): Found, { count: 1, product: Product(102) }
        // Increment count: count.count = 1 + 2 = 3
        // productMap.set(102, { count: 3, product: Product(102) })
        // Item 2: Product ID 103, Quantity 1
        // productMap.get(103): Found, { count: 4, product: Product(103) }
        // Increment count: count.count = 4 + 1 = 5
        // productMap.set(103, { count: 5, product: Product(103) })

        // Final productMap State
        // {
        //     101: { count: 5, product: Product(101) },
        //     102: { count: 3, product: Product(102) },
        //     103: { count: 5, product: Product(103) }
        // }

        // Formatting and Sorting
        const productsTopSelling = Array.from(productMap.values()).map(item => ({
            ...item.product.toObject(),
            countitems: item.count
        })).sort((a, b) => b.countitems - a.countitems); // Sort in descending order

        // Fetch settings data
        const settings = await Settings.find({}, { "__v": false });


        res.json({ status: httpStatusText.SUCCESS, categories, products: productsTopSelling, settings });
    } catch (error) {
        console.error('Error in /home route:', error);
        res.status(500).json({ status: httpStatusText.FAIL, message: 'Internal Server Error' });
    }
});

module.exports = router;
