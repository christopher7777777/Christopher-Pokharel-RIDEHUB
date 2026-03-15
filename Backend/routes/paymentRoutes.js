const express = require('express');
const router = express.Router();
const { initiatePayment, verifyPayment, getSellerPayments } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/initiate', protect, initiatePayment);
router.get('/verify', verifyPayment);
router.get('/seller-payouts', protect, getSellerPayments);

module.exports = router;
