const Order = require('../models/orderModel');
const httpStatusText = require("../utils/httpStatusText");

exports.deliveryApprove = async (req, res) => {
    const { orderid, deliveryid } = req.body;

    try {
        // Find the order and check if the status is 2
        const order = await Order.findOne({ orders_id: orderid, orders_status: 2 });

        if (!order) {
            return res.status(404).json({ status: httpStatusText.FAIL, message: 'Order not found or not in the correct status.' });
        }

        // Update the order's status to 3 and set the delivery ID
        order.orders_status = 3;
        order.orders_delivery = deliveryid;

        await order.save();

        res.json({ status: httpStatusText.SUCCESS, message: 'Delivery approved and order updated.' });
    } catch (error) {
        console.error('Error in /deliveryApprove route:', error);
        res.status(500).json({ status: httpStatusText.FAIL, message: 'Internal Server Error' });
    }
};

exports.deliveryPending = async (req, res) => {
    try {
        const pendingOrders = await Order.find({ orders_status: 2 }).populate('orders_addressid');

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
        console.error('Error in /deliveryPending route:', error);
        res.status(500).json({ status: httpStatusText.FAIL, message: 'Internal Server Error' });
    }
};

exports.deliveryAccepted = async (req, res) => {
    const {deliveryid} = req.body;

    try {
        const acceptedOrders = await Order.find({ orders_status: 3, orders_delivery: deliveryid }).populate('orders_addressid');;

        if (!acceptedOrders) {
            return res.status(404).json({ status: httpStatusText.FAIL, message: 'Order not found or not in the correct status.' }); 
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
        console.error('Error in /deliveryAccepted route:', error);
        res.status(500).json({ status: httpStatusText.FAIL, message: 'Internal Server Error' });
    }
};

exports.deliveryDone = async (req, res) => {
    const { orderid, userid } = req.body;

    try {
        const order = await Order.findOne({ orders_id: orderid, orders_status: 3 });

        if (!order) {
            return res.status(404).json({ status: httpStatusText.FAIL, message: 'Order not found or not in the correct status.' });
        }

        // Update the order's status to 4
        order.orders_status = 4;

        await order.save();

        res.json({ status: httpStatusText.SUCCESS, message: 'Order marked as done.' });
    } catch (error) {
        console.error('Error in /deliveryDone route:', error);
        res.status(500).json({ status: httpStatusText.FAIL, message: 'Internal Server Error' });
    }
};

exports.deliveryArchive = async (req, res) => {
    const { deliveryid } = req.body;

    try {
        const archivedOrders = await Order.find({ orders_status: 4, orders_delivery: deliveryid }).populate('orders_addressid');

        const formattedOrders = archivedOrders.map(order => ({
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


        res.json({ status: httpStatusText.SUCCESS, data: formattedOrders });
    } catch (error) {
        console.error('Error in /deliveryArchive route:', error);
        res.status(500).json({ status: httpStatusText.FAIL, message: 'Internal Server Error' });
    }
};
