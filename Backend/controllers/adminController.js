const User = require('../models/User');
const Bike = require('../models/Bike');
const KYC = require('../models/KYC');
const ServiceReview = require('../models/ServiceReview');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');

// @desc    Get all admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalBikes = await Bike.countDocuments();
        const pendingKYC = await KYC.countDocuments({ status: 'pending' });
        const totalReviews = await ServiceReview.countDocuments();
        const pendingPayments = await Payment.countDocuments({ escrowStatus: 'pending' });

        const revenue = 0;

        res.json({
            success: true,
            data: {
                totalUsers,
                totalBikes,
                pendingKYC,
                totalReviews,
                pendingPayments,
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

// @desc    Get all pending escrow payments
// @route   GET /api/admin/escrow-payments
// @access  Private/Admin
const getPendingEscrowPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ escrowStatus: 'pending' })
            .populate('user', 'name email')
            .populate('seller', 'name email esewaId')
            .populate('bike', 'name model brand')
            .sort('-createdAt');

        res.json({
            success: true,
            count: payments.length,
            data: payments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Release escrow payment to seller
// @route   POST /api/admin/release-payment/:id
// @access  Private/Admin
const releaseEscrowPayment = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id).populate('seller');
        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment record not found' });
        }

        if (payment.escrowStatus !== 'pending') {
            return res.status(400).json({ success: false, message: 'Payment is not in pending state' });
        }

        if (!payment.seller || !payment.seller.esewaId) {
            return res.status(400).json({
                success: false,
                message: 'Seller has not provided their eSewa ID'
            });
        }

        // Calculate commission (10% platform fee)
        const commissionRate = 0.10;
        const commission = payment.amount * commissionRate;
        const finalAmount = payment.amount - commission;

        payment.commission = commission;
        payment.finalAmount = finalAmount;
        payment.escrowStatus = 'released';
        payment.releasedAt = Date.now();

        await payment.save();

        // Create Notifications
        try {
            // Notification for Seller
            await Notification.create({
                user: payment.seller._id,
                title: 'Funds Released!',
                message: `Rs ${finalAmount.toLocaleString()} has been released to your eSewa account (${payment.seller.esewaId}) for the rental of ${payment.productName}. (Platform Fee: Rs ${commission.toLocaleString()})`,
                type: 'PAYMENT_RECEIVED',
                relatedId: payment._id
            });

            // Notification for User (Renter)
            await Notification.create({
                user: payment.user,
                title: 'Payment Processed',
                message: `Your rental payment for ${payment.productName} has been successfully verified and processed to the seller.`,
                type: 'PAYMENT_RELEASED',
                relatedId: payment._id
            });
        } catch (notificationError) {
            console.error('Failed to create notifications:', notificationError);
            // We don't return error here because the payment was already successfully released in DB
        }

        res.json({
            success: true,
            message: 'Payment released to seller successfully',
            data: {
                amount: payment.amount,
                commission,
                finalAmount,
                sellerEsewaId: payment.seller.esewaId
            }
        });
    } catch (error) {
        console.error('Release payment error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
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
    deleteReview,
    getPendingEscrowPayments,
    releaseEscrowPayment
};
