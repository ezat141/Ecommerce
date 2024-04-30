const Favorite = require('../models/favorite');
const Product = require('../models/Product');

// Controller function to add a product to favorites
exports.addToFavorites = async (req, res) => {
    try {
        const { favorite_usersid, favorite_productsid } = req.body;

        // Check if the favorite already exists
        const existingFavorite = await Favorite.findOne({ favorite_usersid, favorite_productsid });

        if (existingFavorite) {
            return res.status(400).json({ success: false, message: 'Product already in favorites' });
        }

        // Create a new favorite
        const favorite = new Favorite({
            favorite_usersid,
            favorite_productsid
        });

        // Save the favorite
        await favorite.save();
        // Update the favorite field in the Product model
        // await Product.updateOne({ _id: favorite_productsid }, { favorite: true });

        res.status(201).json({ status: httpStatusText.SUCCESS, favorite });
    } catch (error) {
        console.error('Error adding to favorites:', error);
        res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
};

// Controller function to remove a product from favorites
exports.removeFromFavorites = async (req, res) => {
    try {
        const { favorite_usersid, favorite_productsid } = req.body;

        // Check if the favorite exists
        const existingFavorite = await Favorite.findOne({ favorite_usersid, favorite_productsid });

        if (!existingFavorite) {
            return res.status(400).json({ success: false, message: 'Product not found in favorites' });
        }

        // Remove the favorite
        await Favorite.deleteOne({ favorite_usersid, favorite_productsid });

        // Update the favorite field in the Product model
        // await Product.updateOne({ _id: favorite_productsid }, { favorite: false });

        res.status(200).json({ status: httpStatusText.SUCCESS, message: 'Product removed from favorites' });
    } catch (error) {
        console.error('Error removing from favorites:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

