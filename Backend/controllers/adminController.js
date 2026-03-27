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

        // Calculate platform revenue (sum of commissions)
        const revenueResult = await Payment.aggregate([
            { $match: { escrowStatus: 'released' } },
            { $group: { _id: null, total: { $sum: "$commission" } } }
        ]);

        const revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        // --- CHART DATA CALCULATION ---
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            last7Days.push(d.toISOString().split('T')[0]);
        }

        // Aggregate daily revenue (commission)
        const revenueAgg = await Payment.aggregate([
            {
                $match: {
                    escrowStatus: 'released',
                    createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$commission" }
                }
            }
        ]);

        // Aggregate daily new users
        const usersAgg = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    users: { $sum: 1 }
                }
            }
        ]);

        // --- RECENT ACTIVITY ---
        // Fetch last 5 of each type and merge
        const recentKYCs = await KYC.find({}).sort('-updatedAt').limit(5).populate('user', 'name');
        const recentPayments = await Payment.find({}).sort('-createdAt').limit(5).populate('user', 'name');
        const recentBikes = await Bike.find({}).sort('-createdAt').limit(5);

        const recentActivities = [
            ...recentKYCs.map(k => ({
                text: `KYC for '${k.user?.name || 'User'}' ${k.status}`,
                time: k.updatedAt,
                type: 'kyc'
            })),
            ...recentPayments.map(p => ({
                text: `Payment of Rs ${p.amount} received`,
                time: p.createdAt,
                type: 'payment'
            })),
            ...recentBikes.map(b => ({
                text: `New bike listed: '${b.name}'`,
                time: b.createdAt,
                type: 'bike'
            }))
        ].sort((a, b) => b.time - a.time).slice(0, 8);

        // Merge aggregation results with all 7 days (including zeros)
        const chartData = last7Days.map(date => {
            const revItem = revenueAgg.find(item => item._id === date);
            const userItem = usersAgg.find(item => item._id === date);
            const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });

            return {
                name: dayName,
                fullDate: date,
                revenue: revItem ? revItem.revenue : 0,
                users: userItem ? userItem.users : 0
            };
        });

        res.json({
            success: true,
            data: {
                totalUsers,
                totalBikes,
                pendingKYC,
                totalReviews,
                pendingPayments,
                revenue,
                chartData,
                recentActivities,
                targetRevenue: revenue * 1.5, // Just as an example goal
                activeInquiries: totalReviews // Or some other metric like chat count
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

        // Calculate commission (5% platform fee)
        const commissionRate = 0.05;
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

// @desc    Get all financial transaction stats
// @route   GET /api/admin/financials
// @access  Private/Admin
const getFinancials = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let query = {};

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }

        const payments = await Payment.find(query)
            .populate('user', 'name')
            .populate('seller', 'name')
            .sort('-createdAt');

        // Stats calculation (based on filtered or all?) 
        // Usually stats on the page reflect the current filter
        const stats = await Payment.aggregate([
            { $match: { ...query, paymentStatus: 'COMPLETED' } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$amount' },
                    pendingPayouts: {
                        $sum: {
                            $cond: [{ $eq: ['$escrowStatus', 'pending'] }, '$amount', 0]
                        }
                    },
                    commissionEarned: {
                        $sum: {
                            $cond: [{ $eq: ['$escrowStatus', 'released'] }, '$commission', 0]
                        }
                    }
                }
            }
        ]);

        const financialStats = stats.length > 0 ? stats[0] : {
            totalRevenue: 0,
            pendingPayouts: 0,
            commissionEarned: 0
        };

        res.json({
            success: true,
            data: {
                stats: financialStats,
                transactions: payments.map(p => ({
                    id: p.transactionId || p._id,
                    user: p.user?.name || 'Unknown',
                    amount: p.amount,
                    displayAmount: `Rs ${p.amount.toLocaleString()}`,
                    commission: p.commission || 0,
                    type: p.escrowStatus === 'released' ? 'Payout' : 'Payment',
                    status: p.paymentStatus === 'COMPLETED'
                        ? (p.escrowStatus === 'released' ? 'Completed' : 'Processing')
                        : 'Pending',
                    date: new Date(p.createdAt).toLocaleDateString(),
                    fullDate: p.createdAt
                }))
            }
        });
    } catch (error) {
        console.error('Get financials error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    getAdminStats,
    getAllReviews,
    deleteReview,
    getPendingEscrowPayments,
    releaseEscrowPayment,
    getFinancials
};
