// routes/auth.js
const express = require('express');
const router = express.Router(); // This is the key change!
const {
    register,
    login,
    getMe,
    updatePassword,
    forgotPassword,
    resetPassword,
    getAllUsers,
    deleteUser
} = require('../controllers/authController');
const { protect, isAdmin } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/updatepassword', protect, updatePassword);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// Admin routes
router.get('/users', protect, isAdmin, getAllUsers);
router.delete('/users/:id', protect, isAdmin, deleteUser);

module.exports = router;