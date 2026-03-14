const mongoose = require('mongoose');

const ServiceReviewSchema = new mongoose.Schema({
    bike: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bike',
        required: true
    },
    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: [true, 'Please add a rating between 1 and 5'],
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: [true, 'Please add a comment']
    },
    serviceType: {
        type: String,
        enum: ['Buy', 'Sale', 'Exchange', 'Rental'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Prevent user from submitting more than one review per bike transaction
ServiceReviewSchema.index({ bike: 1, reviewer: 1 }, { unique: true });

module.exports = mongoose.model('ServiceReview', ServiceReviewSchema);
