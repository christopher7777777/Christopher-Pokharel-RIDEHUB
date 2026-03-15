const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bike: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bike',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED'],
        default: 'PENDING'
    },
    method: {
        type: String,
        enum: ['esewa'],
        required: true
    },
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    esewaTransactionUuid: {
        type: String,
        unique: true,
        sparse: true
    },
    esewaRefId: {
        type: String,
        sparse: true
    },
    productName: {
        type: String,
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    escrowStatus: {
        type: String,
        enum: ['none', 'pending', 'released'],
        default: 'none'
    },
    commission: {
        type: Number,
        default: 0
    },
    finalAmount: {
        type: Number,
        default: 0
    },
    releasedAt: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
