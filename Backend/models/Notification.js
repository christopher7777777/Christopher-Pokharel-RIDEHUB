const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['PAYMENT_RELEASED', 'PAYMENT_RECEIVED', 'ACCOUNT_UPDATE', 'GENERAL'],
        default: 'GENERAL'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId // Can be Payment ID or Bike ID
    }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
