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
const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');

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
    // await Product.find({}, {"__v": false}).limit(limit).skip(skip).exec();

    try {
        const products = await Product.find({}, {"__v": false, "favorite": false})
            .populate('product_cat');
            const formattedProducts = products.map(product => ({
                _id: product._id,
                product_name: product.product_name,
                product_name_ar: product.product_name_ar,
                product_desc: product.product_desc,
                product_desc_ar: product.product_desc_ar,
                image: product.image,
                product_count: product.product_count,
                product_active: product.product_active,
                product_price: product.product_price,
                product_discount: product.product_discount,
                product_date: product.product_date,
                favorite: product.favorite,
                category_id: product.product_cat._id,
                category_name: product.product_cat.category_name,
                category_name_ar: product.product_cat.category_name_ar,
                category_id: product.product_cat._id
                
            }));
        res.status(200).json({status: httpStatusText.SUCCESS, data: formattedProducts});

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
        // if (!req.file) {

        //     return res.status(400).json({ message: 'Image file is required' });
        // }
    
        // console.log('File received:', req.file);
        // // Upload file to Cloudinary
        // const result = await cloudinary.uploader.upload(req.file.path);
        // console.log('Cloudinary upload result:', result);
    
        // // Remove file from local storage
        // fs.unlinkSync(req.file.path);

        const { product_name, product_name_ar, product_desc,  product_desc_ar, image, product_count, product_price, product_discount, product_cat} = req.body;

        const newProduct = new Product({
            product_name,
            product_name_ar,
            product_desc,
            product_desc_ar,
            image,
            // image: result.secure_url, // Use the Cloudinary image URL
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
    const { id, product_name, product_name_ar, product_desc,  product_desc_ar, image, product_count, product_active, product_price, product_discount, product_cat} = req.body;

    const updateData = { product_name, product_name_ar, product_desc,  product_desc_ar, product_count, product_active, product_price, product_discount, product_cat };
    // If an image URL is provided in the body, add it to updateData
    if (image) {
        updateData.image = image;
    }

    

    try {
        // If an image file is uploaded, upload it to Cloudinary
        // if (req.file) {
        //     const result = await cloudinary.uploader.upload(req.file.path);
        //     // Remove file from local storage
        //     fs.unlinkSync(req.file.path);
        //     // Add the Cloudinary image URL to updateData
        //     updateData.image = result.secure_url;
        // }

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
        // if (!req.file) {

        //     return res.status(400).json({ message: 'Image file is required' });
        // }
    
        // Upload file to Cloudinary
        // const result = await cloudinary.uploader.upload(req.file.path);
    
        // Remove file from local storage
        // fs.unlinkSync(req.file.path);
    
        // Create category with Cloudinary image URL
        const { category_name, category_name_ar, image } = req.body;
        const newCategory = new Category({

            category_name,
            category_name_ar,
            image
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { id, category_name, category_name_ar, image } = req.body;
    const updateData = { category_name, category_name_ar};
    if (image) {
        updateData.image = image;
    }


    try {
        // // If an image file is uploaded, upload it to Cloudinary
        // if (req.file) {
        //     const result = await cloudinary.uploader.upload(req.file.path);
        //     // Remove file from local storage
        //     fs.unlinkSync(req.file.path);
        //     // Add the Cloudinary image URL to updateData
        //     updateData.image = result.secure_url;
        // }
        const category = await Category.findByIdAndUpdate(id, updateData, { new: true });
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

exports.viewPending = async (req, res) => {
    try {
        const pendingOrders = await Order.find({ orders_status: 0 }).populate('orders_addressid');

        if (!pendingOrders) {
            return res.status(404).json({ status: httpStatusText.FAIL, message: 'No pending orders found' });
        }

        const formattedOrders = pendingOrders.map(order => ({
            _id: order._id,
            orders_id: order.orders_id,
            orders_usersid: order.orders_usersid,
            orders_addressid: order.orders_addressid._id,
            orders_type: order.orders_type,
            orders_pricedelivery: order.orders_pricedelivery,
            orders_price: order.orders_price,
            orders_totalprice: order.orders_totalprice,
            orders_couponid: order.orders_couponid,
            orders_paymeentmethod: order.orders_paymeentmethod,
            orders_status: order.orders_status,
            orders_datetime: order.orders_datetime,
            orders_rating: order.orders_rating,
            orders_noterating: order.orders_noterating,
            address_id: order.orders_addressid._id,
            address_usersid: order.orders_addressid.address_usersid,
            address_name: order.orders_addressid.address_name,
            address_city: order.orders_addressid.address_city,
            address_street: order.orders_addressid.address_street,
            address_lat: order.orders_addressid.address_lat,
            address_long: order.orders_addressid.address_long,
        }));

        res.status(200).json({ status: httpStatusText.SUCCESS, data: formattedOrders });
        
    } catch (error) {
        console.error('Error in /viewPending route:', error);
        res.status(500).json({ status: httpStatusText.FAIL, message: 'Internal Server Error' });
    }
};


// New endpoint to view accepted orders (orders_status != 0 and orders_status != 4)
exports.viewAccepted = async (req, res) => {
    try {
        const acceptedOrders = await Order.find({ orders_status: { $ne: 0, $ne: 4 } }).populate('orders_addressid');

        if (!acceptedOrders) {
            return res.status(404).json({ status: httpStatusText.FAIL, message: 'No accepted orders found' });
        }

        const formattedOrders = acceptedOrders.map(order => ({
            _id: order._id,
            orders_id: order.orders_id,
            orders_usersid: order.orders_usersid,
            orders_addressid: order.orders_addressid._id,
            orders_type: order.orders_type,
            orders_pricedelivery: order.orders_pricedelivery,
            orders_price: order.orders_price,
            orders_totalprice: order.orders_totalprice,
            orders_couponid: order.orders_couponid,
            orders_paymeentmethod: order.orders_paymeentmethod,
            orders_status: order.orders_status,
            orders_datetime: order.orders_datetime,
            orders_rating: order.orders_rating,
            orders_noterating: order.orders_noterating,
            address_id: order.orders_addressid._id,
            address_usersid: order.orders_addressid.address_usersid,
            address_name: order.orders_addressid.address_name,
            address_city: order.orders_addressid.address_city,
            address_street: order.orders_addressid.address_street,
            address_lat: order.orders_addressid.address_lat,
            address_long: order.orders_addressid.address_long,
        }));

        res.status(200).json({ status: httpStatusText.SUCCESS, data: formattedOrders });
    } catch (error) {
        console.error('Error in /viewAccepted route:', error);
        res.status(500).json({ status: httpStatusText.FAIL, message: 'Internal Server Error' });
    }
};


exports.ordersDetailsView = async (req, res) => {
    try {
        const { ordersid } = req.body;

        // Find the cart items with the specified ordersid
        const cart = await Cart.findOne({
            'items.cart_orders': ordersid
        }).populate({
            path: 'items.product',
            select: '_id product_name product_name_ar product_desc product_desc_ar image product_count product_active product_price product_discount product_cat product_date __v favorite'
        });

        if (!cart) {
            return res.status(404).json({ status: httpStatusText.FAIL, message: 'Order not found' });
        }

        // Filter items with the specific ordersid and calculate totals
        let itemsPrice = 0;
        let itemCount = 0;
        const filteredItems = cart.items.filter(item => item.cart_orders === ordersid);
        
        if (filteredItems.length === 0) {
            return res.status(404).json({ status: httpStatusText.FAIL, message: 'No items found for the given order' });
        }

        filteredItems.forEach(item => {
            item.productsprice = item.product.product_price * item.quantity;
            itemsPrice += item.productsprice;
            itemCount += item.quantity;
        });

        const items = filteredItems.map(item => ({
            product: item.product,
            quantity: item.quantity,
            cart_orders: item.cart_orders,
            productsprice: item.productsprice,
            _id: item._id
        }));

        const orderDetails = {
            items,
            totalPrice: itemsPrice,
            totalCount: itemCount
            
        };

        res.status(200).json({ status: httpStatusText.SUCCESS, cart: orderDetails });
    } catch (error) {
        res.status(500).json({ status: httpStatusText.FAIL, message: error.message });
    }
};

// New endpoint to prepare order
exports.preparedOrder = async (req, res) => {
    const { orderid, ordertype } = req.body;

    try {
        // Find the order and check if the status is 1
        const order = await Order.findOne({ orders_id: orderid, orders_status: 1 });

        if (!order) {
            return res.status(404).json({ status: httpStatusText.FAIL, message: 'Order not found or not in the correct status.' });
        }

        // Update the order's status based on the orders_type
        if (ordertype === 0) {
            order.orders_status = 2;
        } else {
            order.orders_status = 4;
        }

        await order.save();

        res.json({ status: httpStatusText.SUCCESS, message: 'Order prepared and status updated.' });
    } catch (error) {
        console.error('Error in /preparedOrder route:', error);
        res.status(500).json({ status: httpStatusText.FAIL, message: 'Internal Server Error' });
    }
};


exports.adminApprove = async (req, res) => {
    const { orderid } = req.body;

    try {
        // Find the order and check if the status is 2
        const order = await Order.findOne({ orders_id: orderid, orders_status: 0 });

        if (!order) {
            return res.status(404).json({ status: httpStatusText.FAIL, message: 'Order not found or not in the correct status.' });
        }

        order.orders_status = 1;

        await order.save();

        res.json({ status: httpStatusText.SUCCESS, message: 'Admin approved and order updated.' });
    } catch (error) {
        console.error('Error in /adminApprove route:', error);
        res.status(500).json({ status: httpStatusText.FAIL, message: 'Internal Server Error' });
    }
};


exports.archiveOrders = async (req, res) => {
    // const { orders_usersid } = req.body;

    try {
        const orders = await Order.find({ orders_status: 4 }).populate('orders_addressid');

        if (orders.length === 0) {
            return res.status(404).json({ status: httpStatusText.FAIL, message: 'No orders to archive' });
        }

        // for (const order of orders) {
        //     // Archive the order
        //     // Implement your archiving logic here
        //     order.orders_status = 5; // Example status for archived
        //     await order.save();
        // }

        // Prepare the response data
        const responseData = orders.map(order => ({
            _id: order._id,
            orders_id: order.orders_id,
            orders_usersid: order.orders_usersid,
            orders_addressid: order.orders_addressid._id,
            orders_type: order.orders_type,
            orders_pricedelivery: order.orders_pricedelivery,
            orders_price: order.orders_price,
            orders_totalprice: order.orders_totalprice,
            orders_couponid: order.orders_couponid,
            orders_rating: order.orders_rating,
            orders_noterating: order.orders_noterating,
            orders_paymeentmethod: order.orders_paymeentmethod,
            orders_status: order.orders_status,
            orders_datetime: order.orders_datetime,
            address_id: order.orders_addressid._id,
            address_usersid: order.orders_addressid.address_usersid,
            address_name: order.orders_addressid.address_name,
            address_city: order.orders_addressid.address_city,
            address_street: order.orders_addressid.address_street,
            address_lat: order.orders_addressid.address_lat,
            address_long: order.orders_addressid.address_long
        }));

        res.status(200).json({ status: httpStatusText.SUCCESS, data: responseData });
    } catch (error) {
        res.status(500).json({ status: httpStatusText.FAIL, message: error.message });
    }
};
