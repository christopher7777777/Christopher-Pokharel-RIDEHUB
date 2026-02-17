const User = require('../models/User');
const Bike = require('../models/Bike');
const KYC = require('../models/KYC');

// @desc    Get all admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalBikes = await Bike.countDocuments();
        const pendingKYC = await KYC.countDocuments({ status: 'pending' });

        const revenue = 0;

        res.json({
            success: true,
            data: {
                totalUsers,
                totalBikes,
                pendingKYC,
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

module.exports = {
    getAdminStats
};
