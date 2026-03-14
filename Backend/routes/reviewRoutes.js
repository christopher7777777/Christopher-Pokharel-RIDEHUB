const express = require('express');
const router = express.Router();
const {
    createReview,
    getBikeReviews,
    getSellerReviews
} = require('../controllers/serviceReviewController');
const { protect } = require('../middleware/auth');

router.route('/')
    .post(protect, createReview);

router.route('/bike/:bikeId')
    .get(getBikeReviews);

router.route('/seller/:sellerId')
    .get(getSellerReviews);

module.exports = router;
