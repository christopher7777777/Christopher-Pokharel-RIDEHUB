const mongoose = require('mongoose');

const valuationRuleSchema = new mongoose.Schema({
    ccRange: {
        type: String,
        required: [true, 'CC Range is required'],
        unique: true
    },
    basePrice: {
        type: Number,
        required: [true, 'Base price is required']
    },
    conditionA: {
        type: Number,
        required: [true, 'Condition A depreciation is required'],
        default: 5
    },
    conditionB: {
        type: Number,
        required: [true, 'Condition B depreciation is required'],
        default: 15
    },
    conditionC: {
        type: Number,
        required: [true, 'Condition C depreciation is required'],
        default: 30
    },
    yearlyDepreciation: {
        type: Number,
        required: [true, 'Yearly depreciation is required'],
        default: 10
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ValuationRule', valuationRuleSchema);
