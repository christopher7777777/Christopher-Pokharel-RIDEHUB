const express = require('express');
const router = express.Router();
const {
    createBike,
    getMyBikes,
    updateBike,
    deleteBike,
    getBike,
    getAllBikes
} = require('../controllers/bikeController');
const { protect, isSeller } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.route('/')
    .get(getAllBikes)
    .post(protect, isSeller, upload.array('images', 4), createBike);

router.route('/my-listings')
    .get(protect, isSeller, getMyBikes);

router.route('/:id')
    .get(getBike)
    .put(protect, isSeller, upload.array('images', 4), updateBike)
    .delete(protect, isSeller, deleteBike);

module.exports = router;
