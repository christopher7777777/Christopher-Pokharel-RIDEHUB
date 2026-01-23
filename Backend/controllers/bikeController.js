const Bike = require('../models/Bike');
const sendEmail = require('../utils/sendEmail');

// @desc    Create new bike listing
// @route   POST /api/bikes
// @access  Private/Seller
exports.createBike = async (req, res) => {
    try {
        req.body.seller = req.user.id;
        req.body.images = [];

        // Handle file uploads
        if (req.files) {
            // If using upload.fields()
            if (req.files.images) {
                req.body.images = req.files.images.map(file => file.path);
            }
            if (req.files.bluebook) {
                req.body.bluebookImage = req.files.bluebook[0].path;
            }
            // If using upload.array() as fallback
            if (Array.isArray(req.files) && req.files.length > 0) {
                req.body.images = req.files.map(file => file.path);
            }
        }

        // If it's a seller, newly added bikes should be 'Available'
        // If it's a user listing for 'Sale' or 'Purchase', it should be 'Pending Review'
        if (req.user.role === 'seller') {
            req.body.status = 'Available';
        } else if (req.body.listingType === 'Sale' || req.body.listingType === 'Purchase') {
            req.body.status = 'Pending Review';
        } else {
            req.body.status = 'Available';
        }

        const bike = await Bike.create(req.body);

        res.status(201).json({
            success: true,
            data: bike
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all bikes listed by the dealer (Seller -> User flow)
// @route   GET /api/bikes/my-listings
// @access  Private/Seller
exports.getMyBikes = async (req, res) => {
    try {
        // Show only bikes listed by the current dealer/seller
        // This includes their inventory available for rent/sale
        const bikes = await Bike.find({ seller: req.user.id }).sort('-createdAt');

        res.status(200).json({
            success: true,
            count: bikes.length,
            data: bikes
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update bike listing
// @route   PUT /api/bikes/:id
// @access  Private/Seller
exports.updateBike = async (req, res) => {
    try {
        let bike = await Bike.findById(req.params.id);

        if (!bike) {
            return res.status(404).json({
                success: false,
                message: 'Bike listing not found'
            });
        }

        // Make sure user is the bike owner
        if (bike.seller.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to update this listing'
            });
        }

        // Handle image updates
        let updatedImages = [];

        // Add existing images that were kept
        if (req.body.existingImages) {
            const existing = Array.isArray(req.body.existingImages)
                ? req.body.existingImages
                : [req.body.existingImages];
            updatedImages = [...existing];
        }

        // Handle file uploads (images and bluebook)
        if (req.files) {
            if (req.files.images) {
                const newImages = req.files.images.map(file => file.path);
                updatedImages = [...updatedImages, ...newImages];
            }
            if (req.files.bluebook) {
                req.body.bluebookImage = req.files.bluebook[0].path;
            }
        }

        // Set the final images array for the model
        req.body.images = updatedImages;

        // If a seller is updating a 'Pending Review' bike, it should probably become 'Available'
        // (This handles bikes that were incorrectly set to Pending Review previously)
        if (req.user.role === 'seller' && bike.status === 'Pending Review') {
            req.body.status = 'Available';
        }

        bike = await Bike.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: bike
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete bike listing
// @route   DELETE /api/bikes/:id
// @access  Private/Seller
exports.deleteBike = async (req, res) => {
    try {
        const bike = await Bike.findById(req.params.id);

        if (!bike) {
            return res.status(404).json({
                success: false,
                message: 'Bike listing not found'
            });
        }

        // Make sure user is the bike owner
        if (bike.seller.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to delete this listing'
            });
        }

        await bike.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single bike (Public)
// @route   GET /api/bikes/:id
// @access  Public
exports.getBike = async (req, res) => {
    try {
        const bike = await Bike.findById(req.params.id).populate('seller', 'name email');

        if (!bike) {
            return res.status(404).json({
                success: false,
                message: 'Bike listing not found'
            });
        }

        res.status(200).json({
            success: true,
            data: bike
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @route   GET /api/bikes
// @access  Public
exports.getAllBikes = async (req, res) => {
    try {
        const bikes = await Bike.find({ status: 'Available' }).sort('-createdAt');

        res.status(200).json({
            success: true,
            count: bikes.length,
            data: bikes
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get bikes listed by users for the dealer to buy (User -> Seller flow)
// @route   GET /api/bikes/sale-requests
// @access  Private/Seller
exports.getSaleRequests = async (req, res) => {
    try {
        // Show bikes listed by OTHER users that the dealer can purchase
        // Include 'Purchased' status so completed acquisitions show in the Purchase Hub
        const bikes = await Bike.find({
            seller: { $ne: req.user.id },
            listingType: { $in: ['Sale', 'Purchase'] },
            status: { $in: ['Pending Review', 'Negotiating', 'Countered', 'Approved', 'Purchased'] }
        }).populate('seller', 'name email').sort('-createdAt');

        res.status(200).json({
            success: true,
            count: bikes.length,
            data: bikes
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update sale status (Sellers negotiate/approve)
// @route   PUT /api/bikes/sale-status/:id
// @access  Private/Seller
exports.updateSaleStatus = async (req, res) => {
    try {
        const { status, negotiatedPrice, dealerNote } = req.body;

        let bike = await Bike.findById(req.params.id);

        if (!bike) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        bike = await Bike.findByIdAndUpdate(req.params.id, {
            status,
            negotiatedPrice,
            dealerNote
        }, { new: true, runValidators: true });

        res.status(200).json({
            success: true,
            data: bike
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    User counters a dealer offer
// @route   PUT /api/bikes/counter-offer/:id
// @access  Private
exports.counterOffer = async (req, res) => {
    try {
        const { userCounterPrice } = req.body;

        let bike = await Bike.findById(req.params.id);

        if (!bike) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        if (bike.seller.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        bike = await Bike.findByIdAndUpdate(req.params.id, {
            status: 'Countered',
            userCounterPrice,
            userConfirmed: false
        }, { new: true });

        res.status(200).json({
            success: true,
            data: bike
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    User confirms sale
// @route   PUT /api/bikes/confirm-sale/:id
// @access  Private
exports.confirmSale = async (req, res) => {
    try {
        const { paymentMethod, userBankDetails } = req.body;
        let userQrImage = '';

        if (req.files && req.files.userQrImage) {
            userQrImage = req.files.userQrImage[0].path;
        }

        let bike = await Bike.findById(req.params.id);

        if (!bike) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        // If the bike is listed by a USER (for sale to dealer), only that user can confirm the deal.
        if (bike.status !== 'Available' && bike.seller.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const updateData = {
            userConfirmed: true,
            paymentMethod,
            userBankDetails,
            // Only update status if it's not already purchased
            status: bike.status === 'Purchased' ? 'Purchased' : 'Approved'
        };

        if (userQrImage) updateData.userQrImage = userQrImage;

        bike = await Bike.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).populate('seller', 'name email');

        res.status(200).json({
            success: true,
            data: bike
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Seller completes payment
// @route   PUT /api/bikes/complete-payment/:id
// @access  Private/Seller
exports.completePayment = async (req, res) => {
    try {
        const { paymentMessage } = req.body;
        let paymentScreenshot = '';

        if (req.files && req.files.paymentScreenshot) {
            paymentScreenshot = req.files.paymentScreenshot[0].path;
        }

        let bike = await Bike.findById(req.params.id);

        if (!bike) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        const updateData = {
            status: 'Purchased',
            paymentMessage
        };

        if (paymentScreenshot) updateData.paymentScreenshot = paymentScreenshot;

        bike = await Bike.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('seller', 'name email');

        // Send confirmation email
        try {
            await sendEmail({
                email: bike.seller.email,
                subject: 'Payment Completed - Bike Sold!',
                message: `Congratulations! Payment for your bike "${bike.name}" has been processed.\n\nStatus: Purchased\nMessage: ${paymentMessage || 'Check the portal for details.'}`
            });
        } catch (err) {
            console.error('Email error:', err);
        }

        res.status(200).json({
            success: true,
            data: bike
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    User rents a bike
// @route   PUT /api/bikes/rent/:id
// @access  Private
exports.rentBike = async (req, res) => {
    try {
        let bike = await Bike.findById(req.params.id);

        if (!bike) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        if (bike.status !== 'Available') {
            return res.status(400).json({ success: false, message: 'Bike is not available for rent' });
        }

        bike = await Bike.findByIdAndUpdate(req.params.id, {
            status: 'Rented',
            paymentMethod: 'Cash'
        }, { new: true, runValidators: true }).populate('seller', 'name email');

        res.status(200).json({
            success: true,
            data: bike
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
