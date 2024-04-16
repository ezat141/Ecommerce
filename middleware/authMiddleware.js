const jwt = require('jsonwebtoken');
const User = require('../models/User');
const httpStatusText = require('../utils/httpStatusText');
const appError = require('../utils/appError');


const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers['Authorization'] || req.headers['authorization'];
    if(!authHeader) {
        const error = appError.create('token is required', 401, httpStatusText.ERROR)
        return next(error);
    }
    const token = authHeader.split(' ')[1];



    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await User.findById(decoded.userId);
        if(!user) {
            const error = appError.create('token is invalid', 401, httpStatusText.ERROR)
            return next(error);
        }
        req.user = user; // returned: email, id, iat, exp 
        next();
        
    } catch (err) {
        const error = appError.create('token is invalid', 401, httpStatusText.ERROR)
        return next(error);
        
    }
};

const adminMiddleware = (req, res, next) => {
    if(req.user.role !== 'admin'){
        const error = appError.create('You are not authorized to access this resource', 401, httpStatusText.ERROR)
        return next(error);
    }
    next();
};

module.exports = {authMiddleware, adminMiddleware};