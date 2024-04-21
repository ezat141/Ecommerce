const express = require('express');
const router = express.Router();
const httpStatusText = require("../utils/httpStatusText");
const { getAllCategories } = require('../controllers/categoryController');
const { getAllProducts } = require('../controllers/productController');

router.get('/home', async (req, res) => {
    try {
        const categories = await getAllCategories();
        const products = await getAllProducts();
        const combinedResponse = { categories, products };
        res.json({ status: httpStatusText.SUCCESS, data: combinedResponse });
    } catch (error) {
        res.status(500).json({ status: httpStatusText.FAIL, message: 'Internal Server Error' });
    }
});

module.exports = router;
