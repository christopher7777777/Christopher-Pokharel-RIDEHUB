// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, no token'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, token failed'
        });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Not authorized as admin'
        });
    }
};

const isSeller = (req, res, next) => {
    if (req.user && (req.user.role === 'seller' || req.user.isAdmin)) {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Not authorized as seller'
        });
    }
};

const isVerified = (req, res, next) => {
    if (req.user && (req.user.kycStatus === 'verified' || req.user.isAdmin)) {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Your KYC must be verified to perform this action.'
        });
    }
};

module.exports = { protect, isAdmin, isSeller, isVerified };