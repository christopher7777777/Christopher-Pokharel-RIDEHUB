// routes/auth.js
const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getMe,
    updatePassword,
    forgotPassword,
    resetPassword,
    verifyOTP,
    resendOTP,
    getAllUsers,
    deleteUser,
    getSellers,
    updateEsewaId
} = require('../controllers/authController');
const { protect, isAdmin } = require('../middleware/auth');

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/updatepassword', protect, updatePassword);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.get('/sellers', protect, getSellers);
router.put('/update-esewa', protect, updateEsewaId);

// Admin routes
router.get('/users', protect, isAdmin, getAllUsers);
router.delete('/users/:id', protect, isAdmin, deleteUser);

module.exports = router;