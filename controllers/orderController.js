const Order = require('../models/orderModel');
const Coupon = require('../models/couponModel');
const Cart = require('../models/cartModel');
const httpStatusText = require("../utils/httpStatusText");

exports.checkout = async (req, res) => {
    const { orders_usersid, orders_addressid, orders_type, orders_pricedelivery, orders_price, orders_couponid, orders_paymeentmethod } = req.body;
    
    try {
        let orders_totalprice = orders_price;
        let couponDiscount = 0;

        // Ensure if orders_type is "1" (receive), orders_pricedelivery is 0
        let finalPricedelivery = orders_type == 1 ? 0 : orders_pricedelivery;
        orders_totalprice += finalPricedelivery;

        // Check coupon
        if (orders_couponid) {
            const coupon = await Coupon.findById(orders_couponid);
            if (!coupon || coupon.coupon_expiredate <= new Date() || coupon.coupon_count <= 0) {
                return res.status(400).json({ status: httpStatusText.FAIL, message: 'Invalid or expired coupon' });
            }
            couponDiscount = coupon.coupon_discount;
            orders_totalprice -= (orders_price * couponDiscount / 100);

            // Update coupon count
            coupon.coupon_count -= 1;
            await coupon.save();
        }

        const newOrder = new Order({
            orders_usersid,
            orders_addressid,
            orders_type,
            orders_pricedelivery: finalPricedelivery,
            orders_price,
            orders_totalprice,
            orders_couponid,
            orders_paymeentmethod,
            orders_status: 0 // Default status
        });

        await newOrder.save();
        // Update cart_orders in cartModel for the user
        await Cart.updateMany(
            { user: orders_usersid, 'items.cart_orders': 0 },
            { $set: { 'items.$[elem].cart_orders': newOrder.orders_id } },
            { arrayFilters: [{ 'elem.cart_orders': 0 }] }
        );

        // Update cart_orders in cartModel for the user
        // await Cart.updateMany({ user: orders_usersid, cart_orders: 0 }, { cart_orders: newOrder.orders_id });
        // Update cart items with order id
        // await Cart.updateMany(
        //     { user: orders_usersid, cart_orders: 0 },
        //     { $set: { cart_orders: order.orders_id } }
        // );

        res.status(201).json({ status: httpStatusText.SUCCESS, data: newOrder });

    } catch (error) {
        res.status(500).json({ status: httpStatusText.FAIL, message: error.message });
    }
};

exports.viewOrders = async (req, res) => {
    const { orders_usersid } = req.body;
    try {
        const orders = await Order.find({ orders_usersid, orders_status: { $ne: 4 } }).populate('orders_addressid');

        const formattedOrders = orders.map(order => ({
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
            address_id: order.orders_addressid._id,
            address_usersid: order.orders_addressid.address_usersid,
            address_name: order.orders_addressid.address_name,
            address_city: order.orders_addressid.address_city,
            address_street: order.orders_addressid.address_street,
            address_lat: order.orders_addressid.address_lat,
            address_long: order.orders_addressid.address_long,
        }));

        res.status(200).json({ status: 'success', data: formattedOrders });
    } catch (error) {
        res.status(500).json({ status: 'fail', message: error.message });
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

exports.deleteOrders = async (req, res) => {
    const { orders_id } = req.body;

    try {
        const order = await Order.findOne({ orders_id: orders_id });

        if (!order) {
            return res.status(404).json({ status: httpStatusText.FAIL, message: 'Order not found' });
        }

        if (order.orders_status !== 0) {
            return res.status(400).json({ status: httpStatusText.FAIL, message: 'Cannot delete order with status other than 0' });
        }

        await Order.deleteOne({orders_id: orders_id});

        res.status(200).json({ status: httpStatusText.SUCCESS, message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ status: httpStatusText.FAIL, message: error.message });
    }
};

exports.archiveOrders = async (req, res) => {
    const { orders_usersid } = req.body;

    try {
        const orders = await Order.find({ orders_usersid, orders_status: 4 }).populate('orders_addressid');

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
