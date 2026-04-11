const Payment = require('../models/Payment');
const Bike = require('../models/Bike');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');
const { generateEsewaSignature } = require('../utils/esewa');
const notifyUserUpdate = require('../utils/notifyUserUpdate');

const validateEnvironmentVariables = () => {
    const requiredEnvVars = [
        "NEXT_PUBLIC_ESEWA_MERCHANT_CODE",
        "NEXT_PUBLIC_ESEWA_SECRET_KEY",
        "ESEWA_VERIFY_URL"
    ];
    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            throw new Error(`Missing environment variable: ${envVar}`);
        }
    }
};

// @desc    Initiate eSewa payment
// @route   POST /api/payment/initiate
// @access  Private
const initiatePayment = async (req, res) => {
    try {
        console.log('--- Payment Initiation Start ---');
        console.log('Body:', JSON.stringify(req.body));
        console.log('User:', req.user ? req.user._id : 'No user attached');

        validateEnvironmentVariables();
        const { amount, productName, bikeId, bookingDetails } = req.body;

        if (!amount || !productName || !bikeId) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: amount, productName, or bikeId"
            });
        }

        const bike = await Bike.findById(bikeId);
        if (!bike) {
            return res.status(404).json({
                success: false,
                message: "Bike not found"
            });
        }

        const tempUuid = `HUB-${Date.now()}`;

        // Create a pending payment record
        const payment = await Payment.create({
            user: req.user._id,
            bike: bikeId,
            seller: bike.seller,
            amount: amount,
            productName: productName,
            method: 'esewa',
            transactionId: tempUuid,
            esewaTransactionUuid: tempUuid,
            paymentStatus: 'PENDING',
            escrowStatus: 'none',
            bookingDetails: bookingDetails
        });

        const transactionUuid = `HUB-${payment._id}-${Date.now()}`;
        console.log('Final Transaction UUID:', transactionUuid);

        // Update payment record with the final unique UUID
        payment.esewaTransactionUuid = transactionUuid;
        payment.transactionId = transactionUuid;
        await payment.save();

        const esewaConfig = {
            amount: amount.toString(),
            tax_amount: "0",
            total_amount: amount.toString(),
            transaction_uuid: transactionUuid,
            product_code: process.env.NEXT_PUBLIC_ESEWA_MERCHANT_CODE || 'EPAYTEST',
            product_service_charge: "0",
            product_delivery_charge: "0",
            success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment-success`,
            failure_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment-failure`,
            signed_field_names: "total_amount,transaction_uuid,product_code",
        };

        const signatureString = `total_amount=${esewaConfig.total_amount},transaction_uuid=${esewaConfig.transaction_uuid},product_code=${esewaConfig.product_code}`;
        console.log('Signature String:', signatureString);

        const signature = generateEsewaSignature(
            process.env.NEXT_PUBLIC_ESEWA_SECRET_KEY || process.env.ESEWA_SECRET_KEY,
            signatureString
        );

        console.log('Signature generated:', signature);

        res.status(200).json({
            success: true,
            data: {
                paymentId: payment._id,
                esewaConfig: {
                    ...esewaConfig,
                    signature
                }
            }
        });

    } catch (error) {
        console.error('--- Payment Initiation Error ---');
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error creating payment session',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// @desc    Verify eSewa payment
// @route   GET /api/payment/verify
// @access  Public (Callback from eSewa)
const verifyPayment = async (req, res) => {
    try {
        const { paymentId, data } = req.query;

        if (!data) {
            return res.status(400).json({
                success: false,
                message: "Missing data payload"
            });
        }

        let decoded;
        try {
            decoded = JSON.parse(Buffer.from(data, "base64").toString("utf-8"));
        } catch (err) {
            console.error("Failed to decode eSewa data:", err);
            return res.status(400).json({
                success: false,
                message: "Invalid eSewa payload"
            });
        }

        console.log('Decoded eSewa data:', decoded);

        if (decoded.status !== "COMPLETE") {
            console.error('eSewa returned status:', decoded.status);
            return res.status(400).json({
                success: false,
                message: `Payment status is ${decoded.status}, not COMPLETE.`,
                status: decoded.status
            });
        }

        // Find payment by ID or by transaction_uuid
        let payment;
        if (paymentId && paymentId !== 'undefined' && paymentId !== 'null') {
            payment = await Payment.findById(paymentId);
        } else {
            payment = await Payment.findOne({ esewaTransactionUuid: decoded.transaction_uuid });
        }

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment record not found"
            });
        }

        if (payment.paymentStatus === 'COMPLETED') {
            const bike = await Bike.findById(payment.bike);
            console.log('Payment already COMPLETED for ID:', payment._id);
            return res.status(200).json({
                success: true,
                message: "Payment was already verified and processed.",
                data: bike ? {
                    bikeId: bike._id,
                    bikeName: bike.name,
                    listingType: bike.listingType
                } : null
            });
        }

        const esewaVerifyUrl = process.env.ESEWA_VERIFY_URL;
        const verifyUrl = `${esewaVerifyUrl}?product_code=${encodeURIComponent(
            process.env.NEXT_PUBLIC_ESEWA_MERCHANT_CODE
        )}&total_amount=${encodeURIComponent(
            decoded.total_amount
        )}&transaction_uuid=${encodeURIComponent(decoded.transaction_uuid)}`;

        console.log('Verifying with eSewa URL:', verifyUrl);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        try {
            const verifyResponse = await fetch(verifyUrl, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!verifyResponse.ok) {
                const errorText = await verifyResponse.text();
                console.error('eSewa verification responded with error status:', verifyResponse.status, errorText);
                return res.status(400).json({
                    success: false,
                    message: `eSewa gateway verification failed (Status: ${verifyResponse.status})`,
                    gatewayError: errorText
                });
            }

            const verificationResult = await verifyResponse.json();
            console.log('eSewa Verification Result:', verificationResult);

            if (
                verificationResult.status !== "COMPLETE" ||
                verificationResult.transaction_uuid !== decoded.transaction_uuid
            ) {
                console.error('Verification mismatch:', {
                    expectedStatus: "COMPLETE",
                    gotStatus: verificationResult.status,
                    expectedUuid: decoded.transaction_uuid,
                    gotUuid: verificationResult.transaction_uuid
                });
                return res.status(400).json({
                    success: false,
                    message: "Payment verification failed - mismatch in transaction details"
                });
            }

            const verifiedAmount = Number(verificationResult.total_amount);
            if (verifiedAmount !== payment.amount) {
                console.error(`Amount mismatch: Expected ${payment.amount}, got ${verifiedAmount}`);
                // Note: Sometimes decimals might cause issues, check if it's close enough
                if (Math.abs(verifiedAmount - payment.amount) > 0.1) {
                    return res.status(400).json({
                        success: false,
                        message: "Payment amount mismatch"
                    });
                }
            }

            // Update payment record atomically
            const updatedPayment = await Payment.findOneAndUpdate(
                {
                    _id: payment._id,
                    paymentStatus: { $ne: 'COMPLETED' }
                },
                {
                    $set: {
                        paymentStatus: 'COMPLETED',
                        escrowStatus: 'pending',
                        esewaRefId: decoded.ref_id || null
                    }
                },
                { new: true }
            );

            if (!updatedPayment) {
                return res.status(400).json({
                    success: false,
                    message: "Payment already processed or failed to update"
                });
            }

            const bike = await Bike.findById(payment.bike).populate('seller', 'name email');
            const buyer = await User.findById(payment.user);


            // Create Notifications
            const Notification = require('../models/Notification');
            try {
                // Notification for User
                await Notification.create({
                    user: payment.user,
                    title: 'Payment Successful',
                    message: `Rs ${payment.amount} for ${payment.productName} has been received and is held in escrow. Verified by eSewa.`,
                    type: 'PAYMENT_RECEIVED',
                    relatedId: payment._id
                });

                // Notification for Seller
                if (bike && bike.seller) {
                    await Notification.create({
                        user: bike.seller._id,
                        title: 'New Rental/Purchase!',
                        message: `Someone has ${bike.listingType === 'Rental' ? 'rented' : 'purchased'} your ${bike.name}. Rs ${payment.amount} is held in escrow by admin and will be released after verification.`,
                        type: 'GENERAL',
                        relatedId: payment._id
                    });
                }
            } catch (notifErr) {
                console.error('Failed to create notification after payment:', notifErr);
            }

            if (bike) {
                console.log('Updating bike status for bike:', bike._id);
                if (bike.listingType === 'Sale' || bike.listingType === 'Purchase') {
                    bike.status = 'Purchased';
                    bike.purchasedBy = payment.user;

                    // Apply stored sale details if present
                    if (payment.bookingDetails) {
                        bike.paymentMethod = 'Online';
                        bike.deliveryMethod = payment.bookingDetails.deliveryMethod;
                        bike.deliveryCharge = payment.bookingDetails.deliveryCharge;
                        bike.bookingDate = payment.bookingDetails.bookingDate;
                        bike.serviceDay = payment.bookingDetails.serviceDay;
                        bike.userConfirmed = true;
                    }

                } else if (bike.listingType === 'Rental') {
                    bike.status = 'Rented';
                    bike.rentedBy = payment.user;

                    // Apply stored rental details if present
                    if (payment.bookingDetails) {
                        bike.paymentMethod = 'Online';
                        bike.rentalPlan = payment.bookingDetails.rentalPlan || 'Daily';
                        bike.rentalDuration = payment.bookingDetails.rentalDuration || 1;
                        bike.bookingDate = payment.bookingDetails.bookingDate;
                        bike.deliveryMethod = payment.bookingDetails.deliveryMethod;
                        bike.deliveryCharge = payment.bookingDetails.deliveryCharge;
                        bike.serviceDay = payment.bookingDetails.serviceDay;

                        // Recalculate expiry if not explicitly saved
                        let expiryDate = new Date(payment.bookingDetails.bookingDate || Date.now());
                        const duration = payment.bookingDetails.rentalDuration || 1;
                        if (payment.bookingDetails.rentalPlan === 'Weekly') {
                            expiryDate.setDate(expiryDate.getDate() + (duration * 7));
                        } else {
                            expiryDate.setDate(expiryDate.getDate() + duration);
                        }
                        bike.rentalExpiry = expiryDate;
                    }
                }
                await bike.save();
                console.log('Bike status updated successfully');

                const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

                // Send success notification email for Online Payment
                if (bike && buyer) {
                    if (bike.listingType === 'Rental') {
                        // Notify Renter
                        notifyUserUpdate(
                            bike,
                            'Bike Rental Successful - Payment Verified',
                            `Dear ${buyer.name},\n\nYour online payment for "${bike.name}" has been successfully verified!\n\nBooking Date: ${new Date(bike.bookingDate || Date.now()).toDateString()}\nExpiry Date: ${new Date(bike.rentalExpiry || Date.now()).toDateString()}\nTotal Payment: NPR ${payment.amount}\nReference ID: ${payment.esewaRefId || payment._id}\n\nThank you for choosing RIDEHUB!\n\nRate your experience: ${clientUrl}/browse`,
                            buyer.email
                        );

                        // Notify Seller
                        notifyUserUpdate(
                            bike,
                            `New Rental Paid: ${bike.name}`,
                            `Good news! Your bike "${bike.name}" has been rented and paid for online by ${buyer.name}.\n\nRental Period: ${new Date(bike.bookingDate || Date.now()).toDateString()} to ${new Date(bike.rentalExpiry || Date.now()).toDateString()}\nAmount Paid: NPR ${payment.amount}\n\nPlease prepare the bike for delivery/pickup.`
                        );
                    } else {
                        // Notify Buyer
                        notifyUserUpdate(
                            bike,
                            `Purchase Successful - Payment Verified: ${bike.name}`,
                            `Dear ${buyer.name},\n\nYour online payment for the purchase of "${bike.name}" has been successfully verified!\n\nAmount Paid: NPR ${payment.amount}\nBooking Date: ${new Date(bike.bookingDate || Date.now()).toDateString()}\nReference ID: ${payment.esewaRefId || payment._id}\n\nOur team will review the details and contact you soon.\n\nRate our service: ${clientUrl}/browse`,
                            buyer.email
                        );

                        // Notify Seller
                        notifyUserUpdate(
                            bike,
                            `Bike Sold & Paid: ${bike.name}`,
                            `A sale and online payment has been confirmed for "${bike.name}".\n\nBuyer: ${buyer.name}\nAmount Paid: NPR ${payment.amount}\nBooking Date: ${new Date(bike.bookingDate || Date.now()).toDateString()}\n\nPlease check the portal for further actions.`
                        );
                    }
                }
            }

            res.status(200).json({
                success: true,
                message: "Payment verified and processed successfully",
                data: {
                    bikeId: bike._id,
                    bikeName: bike.name,
                    listingType: bike.listingType
                }
            });

        } catch (fetchError) {
            clearTimeout(timeoutId);
            console.error('Fetch Error during eSewa verification:', fetchError);
            return res.status(fetchError.name === 'AbortError' ? 408 : 500).json({
                success: false,
                message: fetchError.name === 'AbortError' ? 'Verification with eSewa timed out' : 'Internal error during verification',
                error: fetchError.message
            });
        }

    } catch (error) {
        console.error('Payment Verification Error:', error);
        res.status(500).json({
            success: false,
            message: 'Payment verification failed',
            details: error.message
        });
    }
};

// @desc    Get payments for seller
// @route   GET /api/payment/seller-payouts
// @access  Private (Seller only)
const getSellerPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ seller: req.user.id, paymentStatus: 'COMPLETED' })
            .populate('user', 'name email mobile')
            .populate('bike', 'name model brand price')
            .sort('-createdAt');

        res.json({
            success: true,
            count: payments.length,
            data: payments
        });
    } catch (error) {
        console.error('Get seller payments error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    initiatePayment,
    verifyPayment,
    getSellerPayments
};
