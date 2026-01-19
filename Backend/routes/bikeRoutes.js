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
    counterOffer
} = require('../controllers/bikeController');
const { protect, isSeller } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.route('/')
    .get(getAllBikes)
    .post(protect, upload.fields([
        { name: 'images', maxCount: 10 },
        { name: 'bluebook', maxCount: 1 }
    ]), createBike);

router.route('/my-listings')
    .get(protect, getMyBikes);

// Seller specific hubs
router.route('/sale-requests')
    .get(protect, isSeller, getSaleRequests);

router.route('/sale-status/:id')
    .put(protect, isSeller, updateSaleStatus);

// User confirmation & counter
router.route('/confirm-sale/:id')
    .put(protect, confirmSale);

router.route('/counter-offer/:id')
    .put(protect, counterOffer);

router.route('/:id')
    .get(getBike)
    .put(protect, upload.fields([
        { name: 'images', maxCount: 10 },
        { name: 'bluebook', maxCount: 1 }
    ]), updateBike)
    .delete(protect, deleteBike);

module.exports = router;
