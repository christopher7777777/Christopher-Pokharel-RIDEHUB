const express = require('express');
const router = express.Router();
const {
    submitKYC,
    getMyKYC,
    getAllKYCs,
    updateKYCStatus
} = require('../controllers/kycController');
const { protect, isAdmin } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.route('/')
    .get(protect, isAdmin, getAllKYCs)
    .post(protect, upload.fields([
        { name: 'nagriktaFront', maxCount: 1 },
        { name: 'nagriktaBack', maxCount: 1 },
        { name: 'userPhoto', maxCount: 1 },
        { name: 'panPhoto', maxCount: 1 }
    ]), submitKYC);

router.route('/my-status')
    .get(protect, getMyKYC);

router.route('/:id')
    .put(protect, isAdmin, updateKYCStatus);

module.exports = router;
