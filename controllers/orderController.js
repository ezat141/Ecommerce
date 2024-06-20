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
