const ServiceReview = require('../models/ServiceReview');
const Bike = require('../models/Bike');

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
    try {
        const { bikeId, rating, comment } = req.body;

        const bike = await Bike.findById(bikeId);
        if (!bike) {
            return res.status(404).json({ success: false, message: 'Bike not found' });
        }

        // Create review
        const review = await ServiceReview.create({
            bike: bikeId,
            reviewer: req.user.id,
            seller: bike.seller,
            rating,
            comment,
            serviceType: bike.listingType
        });

        res.status(201).json({
            success: true,
            data: review
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'You have already reviewed this transaction' });
        }
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get reviews for a bike
// @route   GET /api/reviews/bike/:bikeId
// @access  Public
exports.getBikeReviews = async (req, res) => {
    try {
        const reviews = await ServiceReview.find({ bike: req.params.bikeId }).populate('reviewer', 'name profileImage');
        res.status(200).json({ success: true, data: reviews });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get reviews for a seller
// @route   GET /api/reviews/seller/:sellerId
// @access  Public
exports.getSellerReviews = async (req, res) => {
    try {
        const reviews = await ServiceReview.find({ seller: req.params.sellerId }).populate('reviewer', 'name profileImage').populate('bike', 'name images');
        res.status(200).json({ success: true, data: reviews });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
