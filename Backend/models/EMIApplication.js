const mongoose = require('mongoose');

const emiApplicationSchema = new mongoose.Schema({
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
    loanDetails: {
        totalPrice: { type: Number, required: true },
        downPayment: { type: Number, required: true },
        loanAmount: { type: Number, required: true },
        interestRate: { type: Number, required: true },
        tenure: { type: Number, required: true }, // 12, 24, or 36
        monthlyEMI: { type: Number, required: true }
    },
    personalDetails: {
        fullName: { type: String, required: true },
        occupation: { type: String, required: true },
        monthlyIncome: { type: Number, required: true },
        contactNumber: { type: String, required: true },
        currentAddress: { type: String, required: true }
    },
    documents: {
        citizenship: { type: String, required: true },
        salarySlip: { type: String, required: true },
        lalPurja: { type: String } // Optional but often requested in NP
    },
    status: {
        type: String,
        enum: ['Pending', 'Reviewing', 'Verified', 'Forwarded', 'Approved', 'Rejected', 'Completed'],
        default: 'Pending'
    },
    remarks: {
        type: String,
        trim: true
    }
}, { timestamps: true });

module.exports = mongoose.model('EMIApplication', emiApplicationSchema);
