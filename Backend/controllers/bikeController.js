const Bike = require('../models/Bike');
const sendEmail = require('../utils/sendEmail');
const ValuationRule = require('../models/ValuationRule');

// Email helper handling updates
const notifyUserUpdate = async (bike, subject, message, targetEmail = null) => {
    const emailToUse = targetEmail || (bike && bike.seller && bike.seller.email);

    if (bike && emailToUse) {
        try {
            let attachments = [];
            let imageHtml = '';

            if (bike.images && bike.images.length > 0) {
                const imagePath = bike.images[0];
                const isUrl = imagePath.startsWith('http');

                if (!isUrl) {
                    attachments.push({
                        filename: 'bike.jpg',
                        path: imagePath,
                        cid: 'bikeimage'
                    });
                    imageHtml = `<img src="cid:bikeimage" alt="Bike Image" style="width: 100%; max-width: 600px; border-radius: 10px; margin-bottom: 20px;" />`;
                } else {
                    imageHtml = `<img src="${imagePath}" alt="Bike Image" style="width: 100%; max-width: 600px; border-radius: 10px; margin-bottom: 20px;" />`;
                }
            }

            const htmlMessage = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 10px;">
                        <h2 style="color: #ea580c; text-align: center;">RIDEHUB Update</h2>
                        <div style="background-color: white; padding: 20px; border-radius: 10px; margin-top: 20px;">
                            ${imageHtml}
                            <h3 style="margin-top: 0;">${subject}</h3>
                            <p style="white-space: pre-wrap; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</p>
                            
                            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
                                <h4 style="margin: 0 0 10px 0;">Bike Details:</h4>
                                <table style="width: 100%; font-size: 14px;">
                                    <tr>
                                        <td style="padding: 5px 0; color: #666;">Model:</td>
                                        <td style="padding: 5px 0; font-weight: bold;">${bike.model} (${bike.modelYear})</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 5px 0; color: #666;">Brand:</td>
                                        <td style="padding: 5px 0; font-weight: bold;">${bike.brand}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 5px 0; color: #666;">Ref ID:</td>
                                        <td style="padding: 5px 0; font-family: monospace;">${bike._id.toString().slice(-8).toUpperCase()}</td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                        <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">
                            © ${new Date().getFullYear()} RIDEHUB. All rights reserved.
                        </p>
                    </div>
                </div>
            `;

            await sendEmail({
                email: emailToUse,
                subject: subject,
                message: message,
                html: htmlMessage,
                attachments: attachments
            });
        } catch (err) {
            console.error('Email notification error:', err);
        }
    }
};

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
            status: bike.status === 'Purchased' ? 'Purchased' : 'Approved',
            purchasedBy: req.user.id
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

        bike = await Bike.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).populate('seller', 'name email');

        // Notify Seller (Dealer or User who listed) - Non-blocking
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
                `Dear ${req.user.name},\n\nYou have successfully confirmed the purchase details for ${bike.name}.\n\nTotal Price: NPR ${updateData.negotiatedPrice}\nBooking Date: ${new Date(bookingDate).toDateString()}\nPayment Method: ${paymentMethod}\n\nOur team will review the details and contact you soon.`,
                req.user.email
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
                `Dear ${bike.purchasedBy.name},\n\nGood news! Your payment for "${bike.name}" has been received and confirmed.\n\nStatus: Purchased\nMessage: ${paymentMessage || 'Your order is now being processed for delivery.'}`,
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

        // Email the Renter (User) - Non-blocking
        notifyUserUpdate(
            bike,
            'Bike Rental Successful - Order Confirmed',
            `Dear ${req.user.name},\n\nYour rental for "${bike.name}" has been successfully confirmed!\n\nDuration: ${duration} ${rentalPlan === 'Weekly' ? 'Weeks' : 'Days'}\nStart Date: ${new Date(bookingDate).toDateString()}\nExpiry Date: ${expiryDate.toDateString()}\nDelivery Method: ${deliveryMethod}\nTotal Payment: NPR ${deliveryCharge > 0 ? (bike.price + deliveryCharge) : bike.price}\n\nThank you for choosing RIDEHUB! Your order is successful.`,
            req.user.email
        );

        // Notify the Seller (Dealer)
        notifyUserUpdate(
            bike,
            `New Rental Booking: ${bike.name}`,
            `Good news! Your bike "${bike.name}" has been rented by ${req.user.name}.\n\nRental Period: ${new Date(bookingDate).toDateString()} to ${expiryDate.toDateString()}\nCustomer Contact: ${req.user.email}\n\nPlease prepare the bike for delivery/pickup.`
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

// @desc    Request bike exchange (User)
// @route   PUT /api/bikes/exchange/:id
// @access  Private
exports.requestExchange = async (req, res) => {
    try {
        let { exchangeBikeDetails } = req.body;

        // If coming from FormData, it might be a string stringified JSON
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
        const newOrders = myBikes.filter(b => b.status === 'Rented').length;

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
    getSellerStats: exports.getSellerStats
};
