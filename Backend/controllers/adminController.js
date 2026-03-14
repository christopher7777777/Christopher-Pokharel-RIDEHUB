const User = require('../models/User');
const Bike = require('../models/Bike');
const KYC = require('../models/KYC');
const ServiceReview = require('../models/ServiceReview');

// @desc    Get all admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalBikes = await Bike.countDocuments();
        const pendingKYC = await KYC.countDocuments({ status: 'pending' });
        const totalReviews = await ServiceReview.countDocuments();

        const revenue = 0;

        res.json({
            success: true,
            data: {
                totalUsers,
                totalBikes,
                pendingKYC,
                totalReviews,
                revenue
            }
        });
    } catch (error) {
        console.error('Get admin stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get all service reviews
// @route   GET /api/admin/reviews
// @access  Private/Admin
const getAllReviews = async (req, res) => {
    try {
        const reviews = await ServiceReview.find()
            .populate('reviewer', 'name email')
            .populate('bike', 'name model brand')
            .sort('-createdAt');

        res.json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Delete a review
// @route   DELETE /api/admin/reviews/:id
// @access  Private/Admin
const deleteReview = async (req, res) => {
    try {
        const review = await ServiceReview.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }
        await review.deleteOne();
        res.json({ success: true, message: 'Review removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    getAdminStats,
    getAllReviews,
    deleteReview
};
