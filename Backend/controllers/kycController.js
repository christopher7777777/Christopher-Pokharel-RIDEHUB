const KYC = require('../models/KYC');
const User = require('../models/User');
const Notification = require('../models/Notification');
const notifyAdmins = require('../utils/adminNotification');

// @desc    Submit KYC details
// @route   POST /api/kyc
// @access  Private
exports.submitKYC = async (req, res) => {
    try {
        const {
            name,
            email,
            phoneNumber,
            dob,
            permanentAddress,
            declaration,
            panNumber,
            businessName,
            businessRegistrationNumber,
            businessContactNumber,
            address,
            latitude,
            longitude,
            citizenshipNumber,
            citizenshipIssueDate,
            citizenshipIssueDistrict,
            gender,
            fatherName,
            occupation
        } = req.body;

        // Check if user already has a verified KYC
        const existingKYC = await KYC.findOne({ user: req.user.id });
        if (existingKYC && existingKYC.status === 'verified') {
            return res.status(400).json({
                success: false,
                message: 'You already have a verified KYC. Contact support if you need to update your information.'
            });
        }

        const kycData = {
            user: req.user.id,
            name,
            email,
            phoneNumber,
            dob,
            permanentAddress,
            declaration: declaration === 'true' || declaration === true,
            panNumber,
            businessName,
            businessRegistrationNumber,
            businessContactNumber,
            citizenshipNumber,
            citizenshipIssueDate,
            citizenshipIssueDistrict,
            gender,
            fatherName,
            occupation,
            location: {
                type: 'Point',
                coordinates: longitude && latitude ? [parseFloat(longitude), parseFloat(latitude)] : [],
                address
            },
            status: 'pending'
        };

        let kyc;
        if (existingKYC) {
            // Update existing rejected or pending KYC
            if (req.files) {
                if (req.files.nagriktaFront) kycData.nagriktaFront = req.files.nagriktaFront[0].path;
                if (req.files.nagriktaBack) kycData.nagriktaBack = req.files.nagriktaBack[0].path;
                if (req.files.userPhoto) kycData.userPhoto = req.files.userPhoto[0].path;
                if (req.files.panPhoto) kycData.panPhoto = req.files.panPhoto[0].path;
                if (req.files.photoWithCitizenship) kycData.photoWithCitizenship = req.files.photoWithCitizenship[0].path;
            }
            kyc = await KYC.findByIdAndUpdate(existingKYC._id, kycData, { new: true });
        } else {
            // Handle file uploads for new KYC
            if (req.files) {
                if (req.files.nagriktaFront) kycData.nagriktaFront = req.files.nagriktaFront[0].path;
                if (req.files.nagriktaBack) kycData.nagriktaBack = req.files.nagriktaBack[0].path;
                if (req.files.userPhoto) kycData.userPhoto = req.files.userPhoto[0].path;
                if (req.files.panPhoto) kycData.panPhoto = req.files.panPhoto[0].path;
                if (req.files.photoWithCitizenship) kycData.photoWithCitizenship = req.files.photoWithCitizenship[0].path;
            }
            kyc = await KYC.create(kycData);
        }

        // Update user status
        await User.findByIdAndUpdate(req.user.id, {
            kycStatus: 'pending',
            kycId: kyc._id
        });

        // Notify Admin of new/updated KYC
        await notifyAdmins(
            'New KYC Submission',
            `${name || req.user.name} has submitted a KYC verification request.`,
            'GENERAL',
            kyc._id
        );

        res.status(201).json({
            success: true,
            data: kyc
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get user's KYC status
// @route   GET /api/kyc/my-status
// @access  Private
exports.getMyKYC = async (req, res) => {
    try {
        const kyc = await KYC.findOne({ user: req.user.id });

        res.status(200).json({
            success: true,
            data: kyc
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all KYC requests (Admin)
// @route   GET /api/kyc
// @access  Private/Admin
exports.getAllKYCs = async (req, res) => {
    try {
        const kycs = await KYC.find().populate('user', 'name email role').sort('-submittedAt');

        res.status(200).json({
            success: true,
            count: kycs.length,
            data: kycs
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update KYC status (Admin)
// @route   PUT /api/kyc/:id
// @access  Private/Admin
exports.updateKYCStatus = async (req, res) => {
    try {
        const { status, adminNote } = req.body;

        const kyc = await KYC.findById(req.params.id);
        if (!kyc) {
            return res.status(404).json({
                success: false,
                message: 'KYC request not found'
            });
        }

        kyc.status = status;
        kyc.adminNote = adminNote;
        if (status === 'verified') {
            kyc.verifiedAt = Date.now();
        }
        await kyc.save();

        // Update user status
        await User.findByIdAndUpdate(kyc.user, {
            kycStatus: status
        });

        // Notify user of status update
        await Notification.create({
            user: kyc.user,
            title: `KYC ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            message: status === 'verified'
                ? 'Congratulations! Your identity has been verified. You can now list bikes for sale or rent.'
                : `Sorry, your KYC was rejected. Reason: ${adminNote || 'No reason provided'}. Please update and resubmit.`,
            type: 'ACCOUNT_UPDATE',
            relatedId: kyc._id
        });

        res.status(200).json({
            success: true,
            data: kyc
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
