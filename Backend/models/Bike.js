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
        required: [true, 'Listing type (Rental or Purchase) is required'],
        enum: ['Rental', 'Purchase']
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
