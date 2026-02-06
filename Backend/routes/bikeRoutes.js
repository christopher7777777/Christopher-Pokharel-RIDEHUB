const express = require('express');
const router = express.Router();
const {
    createBike,
    getMyBikes,
    updateBike,
    deleteBike,
    getBike,
    getAllBikes,
    getSaleRequests,
    updateSaleStatus,
    confirmSale,
    counterOffer,
    completePayment,
    rentBike,
    requestExchange,
    valuateExchange,
    getAdminBikes,
    getSellerStats
} = require('../controllers/bikeController');
const { protect, isSeller, isVerified, isAdmin } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.route('/admin/all')
    .get(protect, isAdmin, getAdminBikes);

router.route('/admin/valuate-exchange/:id')
    .put(protect, isAdmin, valuateExchange);

router.route('/')
    .get(getAllBikes)
    .post(protect, isSeller, isVerified, upload.fields([
        { name: 'images', maxCount: 10 },
        { name: 'bluebook', maxCount: 1 }
    ]), createBike);

router.route('/my-listings')
    .get(protect, getMyBikes);

// Seller specific hubs
router.route('/seller/stats')
    .get(protect, isSeller, getSellerStats);

router.route('/sale-requests')
    .get(protect, isSeller, getSaleRequests);

router.route('/sale-status/:id')
    .put(protect, isSeller, updateSaleStatus);

// User confirmation & counter
router.route('/confirm-sale/:id')
    .put(protect, upload.fields([{ name: 'userQrImage', maxCount: 1 }]), confirmSale);

router.route('/complete-payment/:id')
    .put(protect, isSeller, upload.fields([{ name: 'paymentScreenshot', maxCount: 1 }]), completePayment);

router.route('/counter-offer/:id')
    .put(protect, counterOffer);

router.route('/rent/:id')
    .put(protect, rentBike);

router.route('/exchange/:id')
    .put(protect, upload.fields([
        { name: 'blueBookPhoto', maxCount: 1 },
        { name: 'bikeModelPhoto', maxCount: 1 },
        { name: 'fullBikePhoto', maxCount: 1 },
        { name: 'meterPhoto', maxCount: 1 }
    ]), requestExchange);

router.route('/:id')
    .get(getBike)
    .put(protect, upload.fields([
        { name: 'images', maxCount: 10 },
        { name: 'bluebook', maxCount: 1 }
    ]), updateBike)
    .delete(protect, deleteBike);

module.exports = router;
