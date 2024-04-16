const Cart = require('../models/cartModel');

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

exports.addToCart = async(req, res) => {
    try {
        const {productId, quantity} = req.body;
        const cart = await Cart.findOneAndUpdate(
            {user: req.user.id},
            {$push: {items: {product: productId, quantity}}},
            {new: true, upsert: true}

        );
        res.json(cart);
        
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
        
    }
};

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
        const { productId } = req.params;
        const cart = await Cart.findOneAndUpdate(
            { user: req.user.id },
            { $pull: { items: { product: productId } } },
            { new: true }
        );
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};