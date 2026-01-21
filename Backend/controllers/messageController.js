const Message = require('../models/Message');
const sendEmail = require('../utils/sendEmail');

// @desc    Submit a contact form
// @route   POST /api/messages
// @access  Public
exports.submitMessage = async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        const newMessage = await Message.create({
            name,
            email,
            phone,
            message
        });

        // Send email notification
        try {
            await sendEmail({
                email: process.env.FROM_EMAIL, // Send to admin
                subject: 'New Booking Inquiry',
                message: `You have a new inquiry from ${name} (${email}, ${phone}):\n\n${message}`
            });
        } catch (err) {
            console.error('Email error:', err);
        }

        res.status(201).json({
            success: true,
            data: newMessage
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all messages (for seller dashboard)
// @route   GET /api/messages
// @access  Private
exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.find().sort('-createdAt');

        res.status(200).json({
            success: true,
            count: messages.length,
            data: messages
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
// @desc    Update a message (status/notes)
// @route   PUT /api/messages/:id
// @access  Private/Seller
exports.updateMessage = async (req, res) => {
    try {
        const { status, notes } = req.body;
        const { id } = req.params;

        console.log(`[Message Detail] Updating ID: ${id}`);
        console.log(`[Message Detail] New Status: ${status}, Notes: ${notes}`);

        if (!status && notes === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Please provide status or notes to update'
            });
        }

        let message = await Message.findById(id);

        if (!message) {
            console.log(`[Message Detail] Message with ID ${id} not found`);
            return res.status(404).json({
                success: false,
                message: 'Message inquiry not found'
            });
        }

        // Update fields
        if (status) message.status = status;
        if (notes !== undefined) message.notes = notes;

        await message.save();

        console.log(`[Message Detail] Successfully updated message ${id}`);

        res.status(200).json({
            success: true,
            data: message
        });
    } catch (error) {
        console.error(`[Message Detail] Error updating message: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error' || error.message,
            error: error.message
        });
    }
};
