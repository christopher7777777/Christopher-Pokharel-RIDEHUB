const Bike = require('../models/Bike');
const Payment = require('../models/Payment');
const ValuationRule = require('../models/ValuationRule');
const Notification = require('../models/Notification');
const KYC = require('../models/KYC');
const notifyAdmins = require('../utils/adminNotification');
const notifyUserUpdate = require('../utils/notifyUserUpdate');


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
            if (Array.isArray(req.files) && req.files.length > 0) {
                req.body.images = req.files.map(file => file.path);
            }
        }

        //  seller newly added bikes
        if (req.user.role === 'seller') {
            req.body.status = 'Available';
        } else if (req.body.listingType === 'Sale' || req.body.listingType === 'Purchase') {
            req.body.status = 'Pending Review';
        } else {
            req.body.status = 'Available';
        }

        const bike = await Bike.create(req.body);

        // Notify Admin of new listing
        await notifyAdmins(
            'New Bike Listed',
            `${bike.name} has been listed for ${bike.listingType}.`,
            'GENERAL',
            bike._id
        );

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

// @desc    Get all bikes listed 
// @route   GET /api/bikes/my-listings
// @access  Private/Seller
exports.getMyBikes = async (req, res) => {
    try {
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

// @desc    Get bikes purchased or rented by current user
// @route   GET /api/bikes/my-purchases
// @access  Private
exports.getMyPurchases = async (req, res) => {
    try {
        const bikes = await Bike.find({
            $or: [
                { purchasedBy: req.user.id },
                { rentedBy: req.user.id }
            ]
        }).populate('seller', 'name email').sort('-updatedAt');

        // Dynamically update status to Overdue if needed
        const updatedBikes = await Promise.all(bikes.map(async (bike) => {
            if (bike.status === 'Rented' && bike.rentalExpiry && new Date() > new Date(bike.rentalExpiry)) {
                bike.status = 'Overdue';
                await bike.save();
            }
            return bike;
        }));

        res.status(200).json({
            success: true,
            count: updatedBikes.length,
            data: updatedBikes
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

        // final images array for the model
        req.body.images = updatedImages;
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

// @desc    Get bikes listed by users
// @route   GET /api/bikes/sale-requests
// @access  Private/Seller
exports.getSaleRequests = async (req, res) => {
    try {
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

        let bike = await Bike.findById(req.params.id).populate('seller', 'name email');

        if (!bike) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        bike = await Bike.findByIdAndUpdate(req.params.id, {
            status,
            negotiatedPrice,
            dealerNote
        }, { new: true, runValidators: true });

        // Notify the seller (User) about the status update - Non-blocking for speed
        notifyUserUpdate(
            bike,
            `Update on your Bike Listing: ${bike.name}`,
            `Your bike listing status has been updated to: ${status}.\n\nNegotiated Price: NPR ${negotiatedPrice || 'N/A'}\nDealer Note: ${dealerNote || 'None'}\n\nPlease check your dashboard for more details.`
        );

        // Notify user about status update
        await Notification.create({
            user: bike.seller._id,
            title: `Listing Updated: ${bike.name}`,
            message: `Your bike listing status has been updated to: ${status}.`,
            type: 'ACCOUNT_UPDATE',
            relatedId: bike._id
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
        let populatedBike = await Bike.findById(req.params.id).populate('seller', 'name email');
        notifyUserUpdate(
            populatedBike,
            `Counter Offer Sent: ${populatedBike.name}`,
            `Hi ${populatedBike.seller.name},\n\nYou have successfully sent a counter offer of NPR ${userCounterPrice} for "${populatedBike.name}".\n\nWaiting for dealer response.`
        );
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
        const { paymentMethod, userBankDetails, deliveryMethod, deliveryCharge, bookingDate, serviceDay } = req.body;
        let userQrImage = '';

        if (req.files && req.files.userQrImage) {
            userQrImage = req.files.userQrImage[0].path;
        }

        let bike = await Bike.findById(req.params.id);

        if (!bike) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        const updateData = {
            userConfirmed: true,
            paymentMethod,
            userBankDetails,
            deliveryMethod,
            deliveryCharge,
            bookingDate,
            serviceDay,
            status: paymentMethod === 'Online' ? bike.status : (bike.status === 'Purchased' ? 'Purchased' : 'Approved'),
            purchasedBy: paymentMethod === 'Online' ? bike.purchasedBy : req.user.id
        };

        // Calculate final transaction price
        let finalPrice = bike.price;
        if (bike.negotiatedPrice && bike.negotiatedPrice > 0) {
            finalPrice = bike.negotiatedPrice;
        }

        // Deduct exchange valuation
        if (bike.isExchange && bike.exchangeValuation) {
            finalPrice = Math.max(0, finalPrice - bike.exchangeValuation);
        }
        updateData.negotiatedPrice = finalPrice;

        if (userQrImage) updateData.userQrImage = userQrImage;

        // --- NEW: Bypass DB update for Online Payment ---
        if (paymentMethod === 'Online') {
            return res.status(200).json({
                success: true,
                message: 'Validated for online payment',
                data: bike
            });
        }

        bike = await Bike.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).populate('seller', 'name email');

        // Notify Seller (Dealer or User who listed) - Only if not Online payment
        if (paymentMethod !== 'Online') {
            notifyUserUpdate(
                bike,
                `Sale Confirmed: ${bike.name}`,
                `A sale confirmation has been received for "${bike.name}".\n\nStatus: ${bike.status}\nBooking Date: ${new Date(bookingDate).toDateString()}\n\nPlease check the portal for further actions.`
            );

            // Notify Buyer (the person who just clicked confirm)
            if (req.user && req.user.email && req.user.email !== bike.seller.email) {
                notifyUserUpdate(
                    bike,
                    `Purchase Confirmation: ${bike.name}`,
                    `Dear ${req.user.name},\n\nYou have successfully confirmed the purchase details for ${bike.name}.\n\nTotal Price: NPR ${updateData.negotiatedPrice}\nBooking Date: ${new Date(bookingDate).toDateString()}\nPayment Method: ${paymentMethod}\n\nOur team will review the details and contact you soon.\n\nRate our service: ${process.env.CLIENT_URL || 'http://localhost:5173'}/browse`,
                    req.user.email
                );
            }
        }

        // --- NEW: COD Escrow Activation ---
        const isCOD = paymentMethod === 'Cash on Delivery' || (paymentMethod === 'Cash' && deliveryMethod === 'Home Delivery');
        if (isCOD) {
            await Payment.create({
                user: req.user.id,
                bike: bike._id,
                seller: bike.seller._id || bike.seller,
                amount: finalPrice + (Number(deliveryCharge) || 0),
                productName: bike.name,
                method: 'cod',
                transactionId: `COD-${Date.now()}-${req.user.id.toString().slice(-4)}`,
                paymentStatus: 'PENDING',
                escrowStatus: 'pending'
            });

            // Notify Admin
            await notifyAdmins(
                'New COD Order (Escrow Pending)',
                `A new COD order for ${bike.name} has been placed. Escrow is now pending delivery.`,
                'PAYMENT_RECEIVED',
                bike._id
            );
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

        bike = await Bike.findByIdAndUpdate(req.params.id, updateData, { new: true })
            .populate('seller', 'name email')
            .populate('purchasedBy', 'name email');

        // Send confirmation email to Seller - Non-blocking
        notifyUserUpdate(
            bike,
            'Payment Completed - Order Successful!',
            `Congratulations! Payment for your bike "${bike.name}" has been processed.\n\nStatus: Purchased\nMessage: ${paymentMessage || 'Check the portal for details.'}`
        );

        // Send confirmation to Buyer
        if (bike.purchasedBy && bike.purchasedBy.email) {
            notifyUserUpdate(
                bike,
                'Payment Received - Item Purchased!',
                `Dear ${bike.purchasedBy.name},\n\nGood news! Your payment for "${bike.name}" has been received and confirmed.\n\nStatus: Purchased\nMessage: ${paymentMessage || 'Your order is now being processed for delivery.'}\n\nPlease share your feedback: ${process.env.CLIENT_URL || 'http://localhost:5173'}/browse`,
                bike.purchasedBy.email
            );
        }
        res.status(200).json({
            success: true,
            data: bike
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    User rents/extends a bike
// @route   PUT /api/bikes/rent/:id
// @access  Private
exports.rentBike = async (req, res) => {
    try {
        const { paymentMethod, deliveryMethod, deliveryCharge, bookingDate, serviceDay, rentalPlan, rentalDuration } = req.body;

        let bike = await Bike.findById(req.params.id);

        if (!bike) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        // Check if bike is already 
        if (bike.status === 'Rented' && bike.rentedBy.toString() !== req.user.id.toString()) {
            return res.status(400).json({ success: false, message: 'Bike is currently rented by another user' });
        }

        // Calculate rental expiry
        let expiryDate = new Date(bookingDate || Date.now());
        const duration = parseInt(rentalDuration) || 1;

        if (rentalPlan === 'Weekly') {
            expiryDate.setDate(expiryDate.getDate() + (duration * 7));
        } else {
            expiryDate.setDate(expiryDate.getDate() + duration);
        }

        // --- NEW: Bypass DB update for Online Payment ---
        if (paymentMethod === 'Online') {
            return res.status(200).json({
                success: true,
                message: 'Validated for online payment',
                data: bike
            });
        }

        const updateData = {
            status: 'Rented',
            paymentMethod: paymentMethod || 'Cash',
            deliveryMethod,
            deliveryCharge,
            bookingDate,
            serviceDay,
            rentalPlan: rentalPlan || 'Daily',
            rentalExpiry: expiryDate,
            rentedBy: req.user.id
        };

        bike = await Bike.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).populate('seller', 'name email');

        // --- NEW: COD Escrow Activation ---
        const isCOD = paymentMethod === 'Cash on Delivery' || (paymentMethod === 'Cash' && deliveryMethod === 'Home Delivery');
        if (isCOD) {
            await Payment.create({
                user: req.user.id,
                bike: bike._id,
                seller: bike.seller._id || bike.seller,
                amount: (bike.price * duration) + (Number(deliveryCharge) || 0),
                productName: `${bike.name} (${duration} ${rentalPlan === 'Weekly' ? 'Weeks' : 'Days'} Rental)`,
                method: 'cod',
                transactionId: `COD-RENT-${Date.now()}-${req.user.id.toString().slice(-4)}`,
                paymentStatus: 'PENDING',
                escrowStatus: 'pending'
            });

            // Notify Admin
            await notifyAdmins(
                'New COD Rental (Escrow Pending)',
                `A new COD rental for ${bike.name} has been placed. Escrow is now pending delivery.`,
                'PAYMENT_RECEIVED',
                bike._id
            );
        }

        if (paymentMethod !== 'Online') {
            // Email the Renter (User) - Non-blocking
            notifyUserUpdate(
                bike,
                'Bike Rental Successful - Order Confirmed',
                `Dear ${req.user.name},\n\nYour rental for "${bike.name}" has been successfully confirmed!\n\nDuration: ${duration} ${rentalPlan === 'Weekly' ? 'Weeks' : 'Days'}\nStart Date: ${new Date(bookingDate).toDateString()}\nExpiry Date: ${expiryDate.toDateString()}\nDelivery Method: ${deliveryMethod}\nTotal Payment: NPR ${deliveryCharge > 0 ? (bike.price + deliveryCharge) : bike.price}\n\nThank you for choosing RIDEHUB! Your order is successful.\n\nRate your rental experience: ${process.env.CLIENT_URL || 'http://localhost:5173'}/browse`,
                req.user.email
            );

            // Notify the Seller (Dealer)
            notifyUserUpdate(
                bike,
                `New Rental Booking: ${bike.name}`,
                `Good news! Your bike "${bike.name}" has been rented by ${req.user.name}.\n\nRental Period: ${new Date(bookingDate).toDateString()} to ${expiryDate.toDateString()}\nCustomer Contact: ${req.user.email}\n\nPlease prepare the bike for delivery/pickup.`
            );
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

// @desc    Request bike exchange (User)
// @route   PUT /api/bikes/exchange/:id
// @access  Private
exports.requestExchange = async (req, res) => {
    try {
        let { exchangeBikeDetails } = req.body;
        if (typeof exchangeBikeDetails === 'string') {
            try {
                exchangeBikeDetails = JSON.parse(exchangeBikeDetails);
            } catch (e) {

            }
        }

        // Handle File Uploads
        if (req.files) {
            if (req.files.blueBookPhoto) exchangeBikeDetails.blueBookPhoto = req.files.blueBookPhoto[0].path;
            if (req.files.bikeModelPhoto) exchangeBikeDetails.bikeModelPhoto = req.files.bikeModelPhoto[0].path;
            if (req.files.fullBikePhoto) exchangeBikeDetails.fullBikePhoto = req.files.fullBikePhoto[0].path;
            if (req.files.meterPhoto) exchangeBikeDetails.meterPhoto = req.files.meterPhoto[0].path;
        }

        let bike = await Bike.findById(req.params.id);

        if (!bike) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        if (bike.listingType !== 'Sale' && bike.listingType !== 'Purchase') {
            return res.status(400).json({ success: false, message: 'Exchange is only available for bike purchases' });
        }

        // Automatic Valuation Logic 
        let valuation = 0;
        let ccRange = '';
        const cc = Number(exchangeBikeDetails.engineCapacity);

        if (cc < 125) ccRange = 'below-125';
        else if (cc >= 125 && cc <= 200) ccRange = '125-200';
        else if (cc > 200 && cc <= 400) ccRange = '200-400';
        else if (cc > 400) ccRange = 'above-400';

        const rule = await ValuationRule.findOne({ ccRange });

        if (rule) {
            const currentYear = new Date().getFullYear();
            const age = Math.max(0, currentYear - Number(exchangeBikeDetails.modelYear));

            // Determine condition depreciation
            let conditionDepreciationPercent = 0;
            switch (exchangeBikeDetails.condition) {
                case 'Excellent':
                    conditionDepreciationPercent = rule.conditionA;
                    break;
                case 'Good':
                    conditionDepreciationPercent = rule.conditionB;
                    break;
                case 'Average':
                case 'Poor':
                    conditionDepreciationPercent = rule.conditionC;
                    break;
                default:
                    conditionDepreciationPercent = rule.conditionC;
            }

            const ageDepreciationTotal = age * (rule.yearlyDepreciation / 100);
            const conditionDepreciationTotal = conditionDepreciationPercent / 100;
            const totalDepreciationFactor = ageDepreciationTotal + conditionDepreciationTotal;

            const calculatedValue = rule.basePrice * (1 - totalDepreciationFactor);
            valuation = Math.max(rule.basePrice * 0.1, calculatedValue);

            // Round to nearest 100
            valuation = Math.round(valuation / 100) * 100;
        }

        bike = await Bike.findByIdAndUpdate(req.params.id, {
            isExchange: true,
            exchangeBikeDetails,
            exchangeValuation: valuation,
            exchangeStatus: valuation > 0 ? 'Valuated' : 'Pending'
        }, { new: true }).populate('seller', 'name email');

        // Notify User about exchange request - Non-blocking
        notifyUserUpdate(
            bike,
            `Exchange Request Received: ${bike.name}`,
            `Dear ${req.user.name},\n\nYour exchange request for "${bike.name}" has been received.\n\nExchanging: ${exchangeBikeDetails.brand} ${exchangeBikeDetails.model}\nEstimated Valuation: NPR ${valuation}\nStatus: ${bike.exchangeStatus}\n\nOur team will review your bike details and contact you if further information is needed.`,
            req.user.email
        );

        // Notify Dealer/Admin
        notifyUserUpdate(
            bike,
            `New Exchange Request: ${bike.name}`,
            `A new exchange request has been submitted by ${req.user.name} for the bike "${bike.name}".\n\nUser Bike: ${exchangeBikeDetails.brand} ${exchangeBikeDetails.model} (${exchangeBikeDetails.modelYear})\nAuto-Valuation: NPR ${valuation}\n\nPlease check the admin panel to review the uploaded documents and confirm valuation.`
        );

        // Notify Admin of new exchange request
        await notifyAdmins(
            'New Exchange Request',
            `User has requested an exchange for ${bike.name}.`,
            'GENERAL',
            bike._id
        );
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

// @desc    Seller releases bike for delivery
// @route   PUT /api/bikes/release-delivery/:id
// @access  Private/Seller
exports.releaseBikeForDelivery = async (req, res) => {
    try {
        const bike = await Bike.findById(req.params.id).populate('seller');
        if (!bike) {
            return res.status(404).json({ success: false, message: 'Bike not found' });
        }

        // Check if seller is the owner
        const sellerId = bike.seller._id || bike.seller;
        if (sellerId.toString() !== req.user.id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        // Legacy support: if deliveryStatus is already Shipped/Delivered, don't re-release
        if (bike.deliveryStatus === 'Shipped' || bike.deliveryStatus === 'Delivered') {
            return res.status(400).json({ success: false, message: 'Bike already released for delivery' });
        }

        // Use findByIdAndUpdate to bypass validation of other fields for legacy records
        await Bike.findByIdAndUpdate(req.params.id, { deliveryStatus: 'Shipped' });

        // 1. Create System Notification for Buyer
        const buyerId = bike.purchasedBy || bike.rentedBy;
        if (buyerId) {
            await Notification.create({
                user: buyerId,
                title: 'Bike Out for Delivery!',
                message: `Your ${bike.listingType.toLowerCase()} bike "${bike.name}" has been shipped by the seller.`,
                type: 'GENERAL'
            });

            // 2. Send Email with KYC Location
            const User = require('../models/User');
            const buyer = await User.findById(buyerId);
            const kyc = await KYC.findOne({ user: buyerId, status: 'verified' });

            const deliveryLocation = kyc ? (kyc.location?.address || kyc.permanentAddress) : 'the address provided in your profile';

            if (buyer && buyer.email) {
                notifyUserUpdate(
                    bike,
                    'Bike Shipped - You will get it soon!',
                    `Great news! Your bike "${bike.name}" has been released for delivery by the seller and is on its way to your verified location: ${deliveryLocation}. You will get it soon. Expect a call from the delivery partner.`,
                    buyer.email
                );
            }
        }

        res.status(200).json({
            success: true,
            data: bike
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    User confirms bike receipt
// @route   PUT /api/bikes/receive-bike/:id
// @access  Private
exports.receiveBike = async (req, res) => {
    try {
        const bike = await Bike.findById(req.params.id).populate('seller');
        if (!bike) {
            return res.status(404).json({ success: false, message: 'Bike not found' });
        }

        // Check if user is the buyer/renter
        const isBuyer = bike.purchasedBy && bike.purchasedBy.toString() === req.user.id;
        const isRenter = bike.rentedBy && bike.rentedBy.toString() === req.user.id;

        if (!isBuyer && !isRenter) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        if (bike.deliveryStatus !== 'Shipped') {
            return res.status(400).json({ success: false, message: 'Bike is not in transit' });
        }

        bike.deliveryStatus = 'Delivered';
        await bike.save();

        // Update COD payment status to COMPLETED
        if (bike.paymentMethod === 'Cash on Delivery') {
            await Payment.findOneAndUpdate(
                { bike: bike._id, user: req.user.id, method: 'cod', paymentStatus: 'PENDING' },
                { paymentStatus: 'COMPLETED' }
            );
        }

        // Notify Seller
        await Notification.create({
            user: bike.seller._id,
            title: 'Bike Received!',
            message: `The buyer has confirmed receipt of "${bike.name}". Transaction completed.`,
            type: 'GENERAL'
        });

        // Email Seller
        if (bike.seller && bike.seller.email) {
            notifyUserUpdate(
                bike,
                'Order Received - Item Delivered!',
                `Hello ${bike.seller.name}, your bike "${bike.name}" has been received by the user. Transaction successful!`,
                bike.seller.email
            );
        }

        res.status(200).json({
            success: true,
            data: bike
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Admin valuates an exchange request
// @route   PUT /api/bikes/admin/valuate-exchange/:id
// @access  Private/Admin
exports.valuateExchange = async (req, res) => {
    try {
        const { exchangeValuation, status } = req.body;

        let bike = await Bike.findById(req.params.id);

        if (!bike) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        const updateData = {
            exchangeValuation,
            exchangeStatus: status || 'Valuated'
        };

        bike = await Bike.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('seller', 'name email');

        // Notify the User - Non-blocking
        notifyUserUpdate(
            bike,
            `Exchange Valuation Updated: ${bike.name}`,
            `Your exchange request for "${bike.name}" has been reviewed.\n\nNew Valuation: NPR ${exchangeValuation}\nStatus: ${status || 'Valuated'}\n\nPlease check your dashboard to proceed with the transaction.`
        );

        res.status(200).json({
            success: true,
            data: bike
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get dashboard stats for seller
// @route   GET /api/bikes/seller/stats
// @access  Private/Seller
exports.getSellerStats = async (req, res) => {
    try {
        const myBikes = await Bike.find({ seller: req.user.id });

        const activeListings = myBikes.filter(b => b.status === 'Available').length;
        const newOrders = myBikes.filter(b => ['Rented', 'Overdue'].includes(b.status)).length;
        const pendingReturns = myBikes.filter(b => b.status === 'Pending Return').length;

        // Calculate earnings from bikes SOLD by the dealer
        const soldBikes = myBikes.filter(b => b.status === 'Purchased');
        const totalEarnings = soldBikes.reduce((sum, b) => sum + (b.negotiatedPrice || b.price), 0);

        // Recent activity
        const recentBikes = await Bike.find({
            $or: [
                { seller: req.user.id },
                { rentedBy: req.user.id }
            ]
        })
            .populate('seller', 'name')
            .populate('rentedBy', 'name')
            .sort('-updatedAt')
            .limit(5);

        const recentActivity = recentBikes.map(b => ({
            bike: b.name,
            customer: b.rentedBy ? b.rentedBy.name : (b.status === 'Purchased' ? 'Buyer Name' : 'New Client'),
            type: b.listingType === 'Rental' ? 'Bike Rent' : 'Bike Sale',
            amount: b.listingType === 'Rental' ? `NPR ${b.price}/DAY` : `NPR ${b.price.toLocaleString()}`,
            status: b.status,
            time: b.updatedAt
        }));

        res.status(200).json({
            success: true,
            data: {
                totalEarnings,
                activeListings,
                newOrders,
                pendingReturns,
                recentActivity
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all bikes (Admin)
// @route   GET /api/bikes/admin/all
// @access  Private/Admin
exports.getAdminBikes = async (req, res) => {
    try {
        const bikes = await Bike.find().populate('seller', 'name email').sort('-createdAt');

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


// @desc    Initiate bike return (User)
// @route   PUT /api/bikes/return/initiate/:id
// @access  Private
exports.initiateReturn = async (req, res) => {
    try {
        const bike = await Bike.findById(req.params.id).populate('seller');
        if (!bike) {
            return res.status(404).json({ success: false, message: 'Bike not found' });
        }

        // Check if user is the renter
        if (bike.rentedBy.toString() !== req.user.id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        if (bike.status !== 'Rented' && bike.status !== 'Overdue') {
            return res.status(400).json({ success: false, message: 'Bike is not currently rented' });
        }

        // Calculate Late Fee (NPR 500 per extra day)
        let lateFee = 0;
        let lateDays = 0;
        const currentDate = new Date();
        const expiryDate = new Date(bike.rentalExpiry);

        if (currentDate > expiryDate) {
            const diffTime = Math.abs(currentDate - expiryDate);
            lateDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            lateFee = lateDays * 500;
        }

        bike.status = 'Pending Return';
        await bike.save();

        const lateFeeMsg = lateFee > 0 ? ` (Late Fee Accrued: NPR ${lateFee} for ${lateDays} days)` : '';

        // Notify Seller
        await Notification.create({
            user: bike.seller._id,
            title: 'Return Initiated' + (lateFee > 0 ? ' [LATE]' : ''),
            message: `User ${req.user.name} has initiated a return for "${bike.name}".${lateFeeMsg} Please confirm receipt after inspection.`,
            type: 'GENERAL',
            relatedId: bike._id
        });

        // Email Seller
        if (bike.seller && bike.seller.email) {
            notifyUserUpdate(
                bike,
                'Bike Return Notification',
                `Hello ${bike.seller.name}, your bike "${bike.name}" is being returned by the user. Please check your dashboard to confirm the return after inspecting the bike condition.`,
                bike.seller.email
            );
        }

        res.status(200).json({
            success: true,
            message: 'Return initiated successfully',
            data: bike
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Confirm bike return (Seller)
// @route   PUT /api/bikes/return/confirm/:id
// @access  Private/Seller
exports.confirmReturn = async (req, res) => {
    try {
        const bike = await Bike.findById(req.params.id).populate('rentedBy');
        if (!bike) {
            return res.status(404).json({ success: false, message: 'Bike not found' });
        }

        // Check if user is the seller
        if (bike.seller.toString() !== req.user.id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const renter = bike.rentedBy;
        const renterEmail = renter ? renter.email : null;
        const { isMaintenance } = req.body;

        bike.status = isMaintenance ? 'Maintenance' : 'Available';
        bike.rentedBy = null;
        bike.rentalExpiry = null;
        bike.deliveryStatus = 'Pending'; // Reset for next rent
        await bike.save();

        // Notify Renter
        if (renter) {
            await Notification.create({
                user: renter._id,
                title: 'Return Confirmed',
                message: `The seller has confirmed the return of "${bike.name}". Thank you for using RIDEHUB!`,
                type: 'ACCOUNT_UPDATE',
                relatedId: bike._id
            });

            if (renterEmail) {
                notifyUserUpdate(
                    bike,
                    'Rental Successfully Completed',
                    `Dear ${renter.name},\n\nYour return for the bike "${bike.name}" has been confirmed by the seller. The rental process is now complete. We hope you had a great ride!\n\nCheck out more bikes: ${process.env.CLIENT_URL || 'http://localhost:5173'}/browse`,
                    renterEmail
                );
            }
        }

        res.status(200).json({
            success: true,
            message: 'Return confirmed and bike is now available',
            data: bike
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    createBike: exports.createBike,
    getMyBikes: exports.getMyBikes,
    updateBike: exports.updateBike,
    deleteBike: exports.deleteBike,
    getBike: exports.getBike,
    getAllBikes: exports.getAllBikes,
    getSaleRequests: exports.getSaleRequests,
    updateSaleStatus: exports.updateSaleStatus,
    counterOffer: exports.counterOffer,
    confirmSale: exports.confirmSale,
    completePayment: exports.completePayment,
    rentBike: exports.rentBike,
    requestExchange: exports.requestExchange,
    valuateExchange: exports.valuateExchange,
    getAdminBikes: exports.getAdminBikes,
    getSellerStats: exports.getSellerStats,
    releaseBikeForDelivery: exports.releaseBikeForDelivery,
    receiveBike: exports.receiveBike,
    getMyPurchases: exports.getMyPurchases,
    initiateReturn: exports.initiateReturn,
    confirmReturn: exports.confirmReturn
};
