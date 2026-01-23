const mongoose = require('mongoose');

const bikeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Bike name is required'],
        trim: true
    },
    brand: {
        type: String,
        required: [true, 'Brand is required'],
        trim: true
    },
    model: {
        type: String,
        required: [true, 'Model is required'],
        trim: true
    },
    modelYear: {
        type: Number,
        required: [true, 'Model year is required']
    },
    engineCapacity: {
        type: Number,
        required: [true, 'Engine capacity (CC) is required']
    },
    mileage: {
        type: Number,
        required: [true, 'Mileage is required']
    },
    listingType: {
        type: String,
        required: [true, 'Listing type (Rental or Sale) is required'],
        enum: ['Rental', 'Sale', 'Purchase']
    },
    status: {
        type: String,
        enum: ['Available', 'Pending Review', 'Negotiating', 'Countered', 'Approved', 'Purchased', 'Rented', 'Rejected'],
        default: 'Available'
    },
    negotiatedPrice: {
        type: Number,
        default: 0
    },
    userCounterPrice: {
        type: Number,
        default: 0
    },
    dealerNote: {
        type: String,
        trim: true
    },
    userConfirmed: {
        type: Boolean,
        default: false
    },
    paymentMethod: {
        type: String,
        enum: ['QR', 'Cash', 'Bank Transfer', 'None'],
        default: 'None'
    },
    userBankDetails: {
        type: String,
        trim: true
    },
    userQrImage: {
        type: String,
        default: ''
    },
    paymentScreenshot: {
        type: String,
        default: ''
    },
    paymentMessage: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Price is required']
    },
    category: {
        type: String,
        required: [true, 'Category is required']
    },
    condition: {
        type: String,
        required: [true, 'Condition is required']
    },
    images: {
        type: [String],
        default: []
    },
    bluebookImage: {
        type: String,
        default: ''
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Bike', bikeSchema);
