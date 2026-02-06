const Bike = require('../models/Bike');
const sendEmail = require('../utils/sendEmail');
const ValuationRule = require('../models/ValuationRule');

// @desc    Email helper handling updates
const notifyUserUpdate = async (bike, subject, message) => {
    if (bike && bike.seller && bike.seller.email) {
        try {
            // Construct embedded image attachment if available
            let attachments = [];
            let imageHtml = '';

            if (bike.images && bike.images.length > 0) {
                // Assuming local file path, we can attach it
                // If it's a URL, we can use an img tag with src
                const imagePath = bike.images[0];
                const isUrl = imagePath.startsWith('http');

                if (!isUrl) {
                    // Attach local file with CID
                    attachments.push({
                        filename: 'bike.jpg',
                        path: imagePath,
                        cid: 'bikeimage' // same cid value as in the html img src
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
                            <p style="white-space: pre-wrap;">${message.replace(/\n/g, '<br>')}</p>
                            
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
                email: bike.seller.email,
                subject: subject,
                message: message, // Fallback text
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

        let bike = await Bike.findById(req.params.id).populate('seller', 'name email');

        if (!bike) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        bike = await Bike.findByIdAndUpdate(req.params.id, {
            status,
            negotiatedPrice,
            dealerNote
        }, { new: true, runValidators: true });

        // Notify the seller (User) about the status update
        await notifyUserUpdate(
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

        // Notify User confirming their counter offer was sent
        // (Since we don't know the specific Dealer, we just confirm to the User)
        let populatedBike = await Bike.findById(req.params.id).populate('seller', 'name email');
        await notifyUserUpdate(
            populatedBike,
            `Counter Offer Sent: ${populatedBike.name}`,
            `You have successfully sent a counter offer of NPR ${userCounterPrice}.\n\nWaiting for dealer response.`
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
            // Only update status if it's not already purchased
            status: bike.status === 'Purchased' ? 'Purchased' : 'Approved'
        };

        // Calculate and store final transaction price
        let finalPrice = bike.price;
        if (bike.negotiatedPrice && bike.negotiatedPrice > 0) {
            finalPrice = bike.negotiatedPrice;
        }

        // Deduct exchange valuation if applicable
        if (bike.isExchange && bike.exchangeValuation) {
            finalPrice = Math.max(0, finalPrice - bike.exchangeValuation);
        }

        // Store the final calculated price
        updateData.negotiatedPrice = finalPrice;

        if (userQrImage) updateData.userQrImage = userQrImage;

        bike = await Bike.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).populate('seller', 'name email');

        // Notify User that sale is confirmed and pending/approved
        await notifyUserUpdate(
            bike,
            `Sale Confirmed: ${bike.name}`,
            `You have confirmed the sale details for ${bike.name}.\n\nStatus: ${bike.status}\nBooking Date: ${new Date(bookingDate).toDateString()}\n\nPlease proceed with the next steps as instructed.`
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
                subject: 'Payment Completed - Order Successful!',
                message: `Congratulations! Your order is successful.\n\nPayment for your bike "${bike.name}" has been processed.\n\nStatus: Purchased\nMessage: ${paymentMessage || 'Check the portal for details.'}`
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

        // Check if bike is already rented by someone else
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

        // Email the Renter (req.user)
        try {
            await sendEmail({
                email: req.user.email,
                subject: 'Bike Rental Successful - Order Confirmed',
                message: `Dear ${req.user.name},\n\nYour rental for "${bike.name}" has been successfully confirmed!\n\nDuration: ${duration} ${rentalPlan === 'Weekly' ? 'Weeks' : 'Days'}\nStart Date: ${new Date(bookingDate).toDateString()}\nExpiry Date: ${expiryDate.toDateString()}\nDelivery Method: ${deliveryMethod}\nTotal Payment: ${paymentMethod}\n\nThank you for choosing RIDEHUB! Your order is successful.`
            });
        } catch (err) {
            console.error('Rent email error:', err);
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

// @desc    Request bike exchange before purchase
// @route   PUT /api/bikes/exchange/:id
// @access  Private


// ... existing imports ...

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
                // If not JSON, maybe it's just flattened fields, but let's assume JSON for complex objects
                // Or if we sent individual fields, we'd construct it here.
                // For now, assume frontend sends JSON string.
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

        // --- Automatic Valuation Logic ---
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

            // Calculate total depreciation percentage
            // Formula: Age Depreciation + Condition Penalty
            // We apply them as deductions from the base price.
            // Using a simple linear model: Value = Base * (1 - (Age * Yearly%) - Condition%)

            const ageDepreciationTotal = age * (rule.yearlyDepreciation / 100);
            const conditionDepreciationTotal = conditionDepreciationPercent / 100;
            const totalDepreciationFactor = ageDepreciationTotal + conditionDepreciationTotal;

            // Ensure we don't go below 10% of base price or 0
            const calculatedValue = rule.basePrice * (1 - totalDepreciationFactor);
            valuation = Math.max(rule.basePrice * 0.1, calculatedValue);

            // Round to nearest 100
            valuation = Math.round(valuation / 100) * 100;
        }

        bike = await Bike.findByIdAndUpdate(req.params.id, {
            isExchange: true,
            exchangeBikeDetails,
            exchangeValuation: valuation,
            exchangeStatus: valuation > 0 ? 'Valuated' : 'Pending' // Use Pending if no rule found/valuation failed
        }, { new: true });

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

        // If valuated, we might want to update the negotiatedPrice or finalPrice
        // For now, we'll just store the valuation. The frontend will handle the deduction display.

        bike = await Bike.findByIdAndUpdate(req.params.id, updateData, { new: true });

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
