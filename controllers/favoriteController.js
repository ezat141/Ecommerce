const Favorite = require('../models/favorite');
const Product = require('../models/Product');
const User = require('../models/User');
const httpStatusText = require("../utils/httpStatusText");

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

// exports.getFavoritesWithDetails = async (req, res) => {
//     try {
//         const { favorite_usersid } = req.body;

//         // Check if the user exists
//         const userExists = await User.exists({ _id: favorite_usersid });
//         if (!userExists) {
//             return res.status(400).json({ success: false, message: 'User not found' });
//         }

//         // Aggregate to get favorites with product and user details
//         const favoritesWithDetails = await Favorite.aggregate([
//             {
//                 $match: { favorite_usersid: favorite_usersid }
//             },
//             {
//                 $lookup: {
//                     from: 'products',
//                     localField: 'favorite_productsid',
//                     foreignField: '_id',
//                     as: 'product'
//                 }
//             },
//             {
//                 $unwind: '$product'
//             },
//             {
//                 $lookup: {
//                     from: 'users',
//                     localField: 'favorite_usersid',
//                     foreignField: '_id',
//                     as: 'user'
//                 }
//             },
//             {
//                 $unwind: '$user'
//             },
//             {
//                 $project: {
//                     _id: 1,
//                     favorite_usersid: 1,
//                     favorite_productsid: 1,
//                     product: {
//                         _id: '$product._id',
//                         product_name: '$product.product_name',
//                         product_name_ar: '$product.product_name_ar',
//                         product_desc: '$product.product_desc',
//                         product_desc_ar: '$product.product_desc_ar',
//                         image: '$product.image',
//                         product_count: '$product.product_count',
//                         product_active: '$product.product_active',
//                         product_price: '$product.product_price',
//                         product_discount: '$product.product_discount',
//                         product_date: '$product.product_date',
//                         product_cat: '$product.product_cat'
//                         // Add other product fields as needed
//                     },
//                     user: {
//                         _id: '$user._id',
//                         // Add other user fields as needed
//                     }
//                 }
//             }
//         ]);
//         if (!favoritesWithDetails || favoritesWithDetails.length === 0) {
//             return res.status(404).json({ success: false, message: 'No favorites found for the user' });
//         }

//         res.status(200).json({ status: httpStatusText.SUCCESS, data: favoritesWithDetails });
//     } catch (error) {
//         console.error('Error fetching favorites with details:', error);
//         res.status(500).json({ success: false, message: 'Internal Server Error' });
//     }
// };
exports.getFavoritesWithDetails = async (req, res) => {
    try {
        const { favorite_usersid } = req.body;

        // Check if the user exists
        const userExists = await User.exists({ _id: favorite_usersid });
        if (!userExists) {
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        // Find favorites for the user and populate product and user details
        const favoritesWithDetails = await Favorite.find({ favorite_usersid })
            .populate({
                path: 'favorite_productsid',
                model: 'Product',
                select: '-__v -favorite' // Exclude version field from product
            })
            .populate({
                path: 'favorite_usersid',
                model: 'User',
                select: '-username -email -users_phone -users_verifycode -users_approve -role -createdAt -updatedAt -password -__v' // Exclude password and version fields from user
            })
            .select('-__v'); // Exclude version field from favorite

        if (!favoritesWithDetails || favoritesWithDetails.length === 0) {
            return res.status(404).json({ success: false, message: 'No favorites found for the user' });
        }

        res.status(200).json({ status: httpStatusText.SUCCESS, data: favoritesWithDetails });
    } catch (error) {
        console.error('Error fetching favorites with details:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};



