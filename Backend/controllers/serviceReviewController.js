const ServiceReview = require('../models/ServiceReview');
const Bike = require('../models/Bike');

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
    try {
        const { bikeId, rating, comment, serviceType } = req.body;

        if (!bikeId || !rating || !comment || !serviceType) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        const bike = await Bike.findById(bikeId);
        if (!bike) {
            return res.status(404).json({ success: false, message: 'Bike listing not found' });
        }

        const review = await ServiceReview.create({
            bike: bikeId,
            reviewer: req.user.id,
            seller: bike.seller,
            rating,
            comment,
            serviceType
        });

        res.status(201).json({
            success: true,
            data: review
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'You have already reviewed this service' });
        }
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all reviews for a specific bike
// @route   GET /api/reviews/bike/:bikeId
// @access  Public
exports.getBikeReviews = async (req, res) => {
    try {
        const reviews = await ServiceReview.find({ bike: req.params.bikeId })
            .populate('reviewer', 'name email')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all reviews for a seller
// @route   GET /api/reviews/seller/:sellerId
// @access  Public
exports.getSellerReviews = async (req, res) => {
    try {
        const reviews = await ServiceReview.find({ seller: req.params.sellerId })
            .populate('reviewer', 'name')
            .populate('bike', 'name model brand');

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
