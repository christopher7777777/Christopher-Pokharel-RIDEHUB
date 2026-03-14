const express = require('express');
const router = express.Router();
const { getAdminStats, getAllReviews, deleteReview } = require('../controllers/adminController');
const { protect, isAdmin } = require('../middleware/auth');

router.get('/stats', protect, isAdmin, getAdminStats);
router.get('/reviews', protect, isAdmin, getAllReviews);
router.delete('/reviews/:id', protect, isAdmin, deleteReview);

module.exports = router;
