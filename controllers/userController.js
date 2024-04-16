const User = require("../models/User");
exports.getAllUsers = async (req, res) => {

    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({
        message: error.message,
    });
    }
};

// Delete a user (admin only)
exports.deleteUser = async (req, res) => {
    // Check if user is admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden - Admin access required' });
    }

    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({
        message: error.message,
    });
    }
};