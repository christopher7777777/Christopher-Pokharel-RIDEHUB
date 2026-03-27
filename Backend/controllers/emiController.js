const EMIApplication = require('../models/EMIApplication');
const Bike = require('../models/Bike');
const Notification = require('../models/Notification');
const notifyAdmins = require('../utils/adminNotification');

// @desc    Apply for EMI
// @route   POST /api/emi/apply
// @access  Private
exports.applyEMI = async (req, res) => {
    try {
        const { bikeId, loanDetails, personalDetails } = req.body;

        // Parse JSON strings if they come from FormData
        const parsedLoanDetails = typeof loanDetails === 'string' ? JSON.parse(loanDetails) : loanDetails;
        const parsedPersonalDetails = typeof personalDetails === 'string' ? JSON.parse(personalDetails) : personalDetails;

        const bike = await Bike.findById(bikeId);
        if (!bike) {
            return res.status(404).json({ success: false, message: 'Bike not found' });
        }

        if (bike.status !== 'Available') {
            return res.status(400).json({ success: false, message: 'Bike is no longer available for financing' });
        }

        const documents = {};
        if (req.files) {
            if (req.files.citizenship) documents.citizenship = req.files.citizenship[0].path;
            if (req.files.salarySlip) documents.salarySlip = req.files.salarySlip[0].path;
            if (req.files.lalPurja) documents.lalPurja = req.files.lalPurja[0].path;
        }

        // Validate required documents
        if (!documents.citizenship || !documents.salarySlip) {
            return res.status(400).json({ success: false, message: 'Citizenship and Salary Slip are required' });
        }

        const application = await EMIApplication.create({
            user: req.user.id,
            bike: bikeId,
            loanDetails: parsedLoanDetails,
            personalDetails: parsedPersonalDetails,
            documents
        });

        // Update bike status to FinancePending
        bike.status = 'FinancePending';
        await bike.save();

        // Notify Admin of new EMI application
        await notifyAdmins(
            'New EMI Application',
            `User has applied for EMI for ${bike.name}.`,
            'GENERAL',
            application._id
        );

        res.status(201).json({
            success: true,
            data: application
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get user's EMI applications
// @route   GET /api/emi/my-applications
// @access  Private
exports.getMyApplications = async (req, res) => {
    try {
        const applications = await EMIApplication.find({ user: req.user.id })
            .populate('bike')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: applications.length,
            data: applications
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get all EMI applications (Admin)
// @route   GET /api/emi/all
// @access  Private/Admin
exports.getAllApplications = async (req, res) => {
    try {
        const applications = await EMIApplication.find()
            .populate('user', 'name email')
            .populate('bike')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: applications.length,
            data: applications
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update EMI application status (Admin)
// @route   PUT /api/emi/:id/status
// @access  Private/Admin
exports.updateApplicationStatus = async (req, res) => {
    try {
        const { status, remarks } = req.body;
        const application = await EMIApplication.findById(req.params.id);

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        application.status = status;
        if (remarks) application.remarks = remarks;
        await application.save();

        // If approved, we might keep status as FinancePending until final bank confirmation
        // If rejected, we might want to set bike back to Available
        if (status === 'Rejected') {
            const bike = await Bike.findById(application.bike);
            if (bike && bike.status === 'FinancePending') {
                bike.status = 'Available';
                await bike.save();
            }
        }

        // Notify user of status update
        await Notification.create({
            user: application.user,
            title: `EMI Application ${status}`,
            message: status === 'Approved'
                ? `Congratulations! Your EMI application for the bike has been approved. Please visit us to finalize the documents.`
                : `Sorry, your EMI application was rejected. Remarks: ${remarks || 'No remarks provided'}.`,
            type: 'ACCOUNT_UPDATE',
            relatedId: application._id
        });

        res.status(200).json({
            success: true,
            data: application
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
// @desc    Complete EMI 
// @route   PUT /api/emi/:id/complete
// @access  Private
exports.completeEMI = async (req, res) => {
    try {
        const application = await EMIApplication.findById(req.params.id);

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        // Verify user owns this application
        if (application.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        // Only Approved EMIs can be marked as Completed
        if (application.status !== 'Approved') {
            return res.status(400).json({ success: false, message: 'Only Approved EMIs can be marked as completed' });
        }

        application.status = 'Completed';
        await application.save();

        // Update bike status to Purchased
        const bike = await Bike.findById(application.bike);
        if (bike) {
            bike.status = 'Purchased';
            bike.purchasedBy = req.user.id;
            await bike.save();
        }

        res.status(200).json({
            success: true,
            data: application
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
