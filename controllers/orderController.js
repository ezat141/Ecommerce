const Order = require('../models/Order');
const Product = require('../models/Product');


// Create a new order
// exports.createOrder = async (req, res) => {
//     try {
//         const {products, total} = req.body;
//         const order = new Order({
//             user: req.user.id, // Assuming you have implemented user authentication
//             products,
//             total
//         });
//         const newOrder = await order.save();
//         res.status(201).json(newOrder);
        
//     } catch (error) {
//         res.status(400).json({
//             message: error.message
//         });
        
//     }
// };

exports.createOrder = async (req, res) => {
    try {
        const {products} = req.body;

        // Fetch prices of the products from the database
        const productPrices = await Product.find({_id: {$in: products}}, {price: 1});


        let total = 0;
        productPrices.forEach((product) => {
            total += product.price;
        });

        const order = new Order({
            user: req.user.id, // Assuming you have implemented user authentication
            products,
            total
        });
        const newOrder = await order.save();
        res.status(201).json(newOrder);
        
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
        
    }
};


// Get order history for a user
exports.getOrderHistory = async (req, res)=>{
    try {
        const orders = await Order.find({user: req.user.id}).populate('products', 'name price -_id');
        res.status(200).json(orders);
        
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
        
    }

};

// there is a mistake in this function
// Get details of a specific order
exports.getOrderById = async (req, res) =>{
    try {
        const order = await Order.findById(req.params.id).populate('products', 'name price');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(order);
        
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
        
    }

};

// Update the status of an order
exports.updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('products', 'name price -_id');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(order);
        
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
        
    }

};

// Delete an order (admin or user who placed the order)
exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user is admin or user who placed the order
        if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Forbidden - Admin or user who placed the order access required' });
        }

        //await order.remove();
        res.json({ message: 'Order deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};