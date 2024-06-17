const Cart = require('../models/cartModel');
const httpStatusText = require("../utils/httpStatusText");

exports.getCart = async(req, res) => {
    try {
        const cart = await Cart.findOne({user: req.user.id}).populate('items.product');



        res.status(200).json(cart);
        
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
        
    }
};

exports.addToCart = async (req, res) => {
    try {
        const { cart_usersid, cart_productsid } = req.body;
        const cart = await Cart.findOneAndUpdate(
            { user: cart_usersid, 'items.product': cart_productsid },
            { $inc: { 'items.$.quantity': 1 } },
            { new: true, upsert: true }
        );

        if (!cart) {
            const newCart = new Cart({
                user: cart_usersid,
                items: [{ product: cart_productsid, quantity: 1 }]
            });
            await newCart.save();
            res.status(201).json({ status: httpStatusText.SUCCESS, cart: newCart });
        } else {
            res.status(201).json({ status: httpStatusText.SUCCESS, cart });
        }
    } catch (error) {
        res.status(500).json({ status: httpStatusText.FAIL, message: error.message });
    }
};


// exports.addToCart = async (req, res) => {
//     try {
//         const { cart_usersid, cart_productsid } = req.body;
//         let cart = await Cart.findOne({ user: cart_usersid });

//         if (cart) {
//             // Check if the product is already in the cart
//             const itemIndex = cart.items.findIndex(item => item.product.equals(cart_productsid));
//             if (itemIndex > -1) {
//                 // Product exists in the cart, increment the quantity
//                 cart.items[itemIndex].quantity += 1;
//             } else {
//                 // Product does not exist in cart, add as new item
//                 cart.items.push({ product: cart_productsid, quantity: 1 });
//             }
//         } else {
//             // No cart exists, create a new cart
//             cart = new Cart({
//                 user: cart_usersid,
//                 items: [{ product: cart_productsid, quantity: 1 }]
//             });
//         }

//         await cart.save();
//         res.status(201).json({ status: httpStatusText.SUCCESS, cart });
//     } catch (error) {
//         res.status(500).json({ status: httpStatusText.FAIL, message: error.message });
//     }
// };

exports.updateCartItem = async (req, res) => {
    try {
        const {productId, quantity} = req.body;
        const cart = await Cart.findOneAndUpdate(
            {
                user: req.user.id,
                'items.product': productId
            },
            {
                $set: { 'items.$.quantity': quantity }
            },
            {
                new: true
            }
        );
        res.json(cart);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });

    }    
};

exports.removeCartItem = async (req, res) => {
    try {
        const { cart_usersid, cart_productsid } = req.body;
        const cart = await Cart.findOneAndUpdate(
            { user: cart_usersid, 'items.product': cart_productsid },
            { $inc: { 'items.$.quantity': -1 } },
            { new: true }
        );

        if (!cart) {
            return res.status(404).json({ status: httpStatusText.FAIL, message: 'Cart item not found' });
        }

        // Remove the item if quantity is 0
        const updatedItems = cart.items.filter(item => item.product != cart_productsid || item.quantity > 0);
        cart.items = updatedItems;
        await cart.save();

        res.status(200).json({ status: httpStatusText.SUCCESS, cart });
    } catch (error) {
        res.status(500).json({ status: httpStatusText.FAIL, message: error.message });
    }
};

exports.getCountItems = async (req, res) => {
    try {
        const { cart_usersid, cart_productsid } = req.body;

        // Find the cart for the user
        const cart = await Cart.findOne({ user: cart_usersid });

        if (!cart) {
            return res.status(404).json({ status: httpStatusText.FAIL, message: 'Cart not found' });
        }

        // Find the count of the specific item in the cart
        // const itemCount = cart.items.reduce((count, item) => count + item.quantity, 0);

        const itemCount = cart.items.reduce((count, item) => {
            return item.product.toString() === cart_productsid ? count + item.quantity : count;
        }, 0);
        
        res.status(200).json({ status: httpStatusText.SUCCESS, itemCount });
    } catch (error) {
        res.status(500).json({ status: httpStatusText.FAIL, message: error.message });
    }
};