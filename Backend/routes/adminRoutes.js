const express = require('express');
const router = express.Router();
const {
    getAdminStats,
    getAllReviews,
    deleteReview,
    getPendingEscrowPayments,
    releaseEscrowPayment
} = require('../controllers/adminController');
const { protect, isAdmin } = require('../middleware/auth');

router.get('/stats', protect, isAdmin, getAdminStats);
router.get('/reviews', protect, isAdmin, getAllReviews);
router.delete('/reviews/:id', protect, isAdmin, deleteReview);
router.get('/escrow-payments', protect, isAdmin, getPendingEscrowPayments);
router.post('/release-payment/:id', protect, isAdmin, releaseEscrowPayment);

module.exports = router;
