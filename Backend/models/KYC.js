const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required']
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required']
    },
    dob: {
        type: Date,
        required: [true, 'Date of birth is required']
    },
    permanentAddress: {
        type: String,
        required: [true, 'Permanent address is required']
    },
    nagriktaFront: {
        type: String,
        required: [true, 'Citizenship front photo is required']
    },
    nagriktaBack: {
        type: String,
        required: [true, 'Citizenship back photo is required']
    },
    citizenshipNumber: {
        type: String
    },
    citizenshipIssueDate: {
        type: Date
    },
    citizenshipIssueDistrict: {
        type: String
    },
    photoWithCitizenship: {
        type: String
    },
    userPhoto: {
        type: String,
        required: [true, 'User photo is required']
    },
    declaration: {
        type: Boolean,
        required: [true, 'You must accept the declaration'],
        default: false
    },
    // User specific extended fields
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
    },
    fatherName: {
        type: String
    },
    occupation: {
        type: String
    },
    // Common/Seller pan fields
    panNumber: {
        type: String
    },
    panPhoto: {
        type: String
    },
    // Seller specific fields
    businessName: {
        type: String
    },
    businessRegistrationNumber: {
        type: String
    },
    businessContactNumber: {
        type: String
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            index: '2dsphere'
        },
        address: String
    },
    status: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    },
    adminNote: String,
    submittedAt: {
        type: Date,
        default: Date.now
    },
    verifiedAt: Date
});

module.exports = mongoose.model('KYC', kycSchema);
