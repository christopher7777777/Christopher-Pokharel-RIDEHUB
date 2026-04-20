const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Register user/seller
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Email validation: must be @gmail.com
        const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Registration is restricted to @gmail.com emails only'
            });
        }

        // Password validation: at least one letter and one symbol
        const passwordLetterRegex = /[a-zA-Z]/;
        const passwordSymbolRegex = /[^a-zA-Z0-9]/;
        if (!passwordLetterRegex.test(password) || !passwordSymbolRegex.test(password)) {
            return res.status(400).json({
                success: false,
                message: 'Password must contain at least one letter and one symbol'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Check if a verified user with this email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            if (existingUser.isVerified) {
                return res.status(400).json({
                    success: false,
                    message: 'User already exists with this email'
                });
            }
            // If pending (unverified) re-registration, delete stale record
            await existingUser.deleteOne();
        }

        // Generate 6-digit OTP and hash it
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

        // Create user in pending (unverified) state
        const user = await User.create({
            name,
            email,
            password,
            role: role || 'user',
            isVerified: false,
            otp: hashedOtp,
            otpExpire: Date.now() + 10 * 60 * 1000 // 10 minutes
        });

        // Send OTP email
        try {
            await sendEmail({
                email: user.email,
                subject: 'RIDEHUB – Email Verification OTP',
                message: `Your RIDEHUB verification OTP is: ${otp}\n\nThis OTP is valid for 10 minutes. Do not share it with anyone.`,
                html: `
                    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
                        <h2 style="color:#ea580c;margin-bottom:8px;">RIDEHUB Email Verification</h2>
                        <p style="color:#334155;">Hello <strong>${user.name}</strong>,</p>
                        <p style="color:#334155;">Use the OTP below to verify your email address:</p>
                        <div style="background:#1e293b;color:#f97316;font-size:38px;font-weight:bold;letter-spacing:14px;text-align:center;padding:24px 16px;border-radius:14px;margin:28px 0;">
                            ${otp}
                        </div>
                        <p style="color:#475569;">This OTP expires in <strong>10 minutes</strong>. Never share it with anyone.</p>
                        <p style="color:#94a3b8;font-size:13px;">If you did not create a RIDEHUB account, you can safely ignore this email.</p>
                    </div>
                `
            });

            res.status(201).json({
                success: true,
                message: 'Registration successful. Please check your email for the OTP verification code.',
                email: user.email
            });
        } catch (emailError) {
            console.error('OTP email send error:', emailError);
            // Roll back — delete the user so they can try again
            await user.deleteOne();
            return res.status(500).json({
                success: false,
                message: 'Could not send verification email. Please try registering again.'
            });
        }

    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Registration failed'
        });
    }
};


// Login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Check user with password
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email is not registered'
            });
        }

        // Block login for unverified (pending) accounts (Except Admins)
        if (user.isVerified === false && !user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Please verify your email before logging in.',
                email: user.email,
                requiresVerification: true
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Password is incorrect'
            });
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isAdmin: user.isAdmin,
                kycStatus: user.kycStatus,
                token: token,
            },
            message: 'Login successful'
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and OTP'
            });
        }

        // Hash the incoming OTP and compare
        const hashedOtp = crypto.createHash('sha256').update(otp.trim()).digest('hex');

        const user = await User.findOne({
            email,
            otp: hashedOtp,
            otpExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP. Please request a new one.'
            });
        }

        // Activate account
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpire = undefined;
        await user.save({ validateBeforeSave: false });

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Email verified successfully! Welcome to RIDEHUB.',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isAdmin: user.isAdmin,
                kycStatus: user.kycStatus,
                token
            }
        });

    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email'
            });
        }

        const user = await User.findOne({ email, isVerified: false });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No pending account found for this email.'
            });
        }

        // Generate fresh OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

        user.otp = hashedOtp;
        user.otpExpire = Date.now() + 10 * 60 * 1000;
        await user.save({ validateBeforeSave: false });

        try {
            await sendEmail({
                email: user.email,
                subject: 'RIDEHUB – Resend OTP Verification',
                message: `Your new RIDEHUB verification OTP is: ${otp}\n\nThis OTP is valid for 10 minutes.`,
                html: `
                    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
                        <h2 style="color:#ea580c;margin-bottom:8px;">RIDEHUB – New Verification OTP</h2>
                        <p style="color:#334155;">Hello <strong>${user.name}</strong>,</p>
                        <p style="color:#334155;">Here is your new OTP to verify your email address:</p>
                        <div style="background:#1e293b;color:#f97316;font-size:38px;font-weight:bold;letter-spacing:14px;text-align:center;padding:24px 16px;border-radius:14px;margin:28px 0;">
                            ${otp}
                        </div>
                        <p style="color:#475569;">This OTP expires in <strong>10 minutes</strong>.</p>
                        <p style="color:#94a3b8;font-size:13px;">If you did not request this, please ignore this email.</p>
                    </div>
                `
            });

            res.status(200).json({
                success: true,
                message: 'A new OTP has been sent to your email.'
            });
        } catch (emailError) {
            console.error('Resend OTP email error:', emailError);
            return res.status(500).json({
                success: false,
                message: 'Could not send OTP email. Please try again.'
            });
        }

    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};


// Get user profile
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('kycId', 'userPhoto');
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Update password
const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide current and new password'
            });
        }

        //  Find user and get password
        const user = await User.findById(req.user.id).select('+password');

        // Check if current password is correct
        if (!(await user.comparePassword(currentPassword))) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        //  Update and save
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });

    } catch (error) {
        console.error('Password update error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'There is no user with that email'
            });
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();

        await user.save({ validateBeforeSave: false });
        const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/resetpassword/${resetToken}`;

        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password reset token',
                message
            });

            res.status(200).json({
                success: true,
                message: 'Email sent'
            });
        } catch (err) {
            console.error(err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save({ validateBeforeSave: false });

            return res.status(500).json({
                success: false,
                message: 'Email could not be sent',
                error: err.message
            });
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
const resetPassword = async (req, res) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resettoken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid token'
            });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successful'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get all users (Admin)
// @route   GET /api/auth/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().sort('-createdAt');
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Delete user (Admin)
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent deleting yourself
        if (user._id.toString() === req.user.id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete yourself'
            });
        }

        await user.deleteOne();
        res.json({
            success: true,
            message: 'User removed successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const getSellers = async (req, res) => {
    try {
        const sellers = await User.find({ role: 'seller' }).select('name email kycStatus');
        res.json({
            success: true,
            data: sellers
        });
    } catch (error) {
        console.error('Get sellers error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update eSewa ID (Seller)
// @route   PUT /api/auth/update-esewa
// @access  Private
const updateEsewaId = async (req, res) => {
    try {
        const { esewaId } = req.body;

        if (!esewaId) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an eSewa ID'
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.esewaId = esewaId;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'eSewa ID updated successfully',
            data: {
                esewaId: user.esewaId
            }
        });
    } catch (error) {
        console.error('Update eSewa ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
    register,
    login,
    verifyOTP,
    resendOTP,
    getMe,
    updatePassword,
    forgotPassword,
    resetPassword,
    getAllUsers,
    deleteUser,
    getSellers,
    updateEsewaId
};