const express = require('express');
const router = express.Router();
const {
    applyEMI,
    getMyApplications,
    getAllApplications,
    updateApplicationStatus,
    completeEMI
} = require('../controllers/emiController');
const { protect, isAdmin } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.post('/apply', protect, upload.fields([
    { name: 'citizenship', maxCount: 1 },
    { name: 'salarySlip', maxCount: 1 },
    { name: 'lalPurja', maxCount: 1 }
]), applyEMI);

router.get('/my-applications', protect, getMyApplications);

router.get('/all', protect, isAdmin, getAllApplications);

router.put('/:id/status', protect, isAdmin, updateApplicationStatus);
router.put('/:id/complete', protect, completeEMI);


module.exports = router;
