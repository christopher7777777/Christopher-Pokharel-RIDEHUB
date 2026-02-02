const ValuationRule = require('../models/ValuationRule');

// @desc    Get all valuation rules
// @route   GET /api/valuation
// @access  Private/Admin
exports.getValuationRules = async (req, res) => {
    try {
        const rules = await ValuationRule.find().sort({ ccRange: 1 });
        res.status(200).json({
            success: true,
            data: rules
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create or Update valuation rule
// @route   POST /api/valuation
// @access  Private/Admin
exports.upsertValuationRule = async (req, res) => {
    try {
        const { ccRange, basePrice, conditionA, conditionB, conditionC, yearlyDepreciation } = req.body;

        let rule = await ValuationRule.findOne({ ccRange });

        if (rule) {
            rule = await ValuationRule.findOneAndUpdate(
                { ccRange },
                { basePrice, conditionA, conditionB, conditionC, yearlyDepreciation },
                { new: true, runValidators: true }
            );
        } else {
            rule = await ValuationRule.create({
                ccRange,
                basePrice,
                conditionA,
                conditionB,
                conditionC,
                yearlyDepreciation
            });
        }

        res.status(200).json({
            success: true,
            data: rule
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete valuation rule
// @route   DELETE /api/valuation/:id
// @access  Private/Admin
exports.deleteValuationRule = async (req, res) => {
    try {
        const rule = await ValuationRule.findById(req.params.id);

        if (!rule) {
            return res.status(404).json({
                success: false,
                message: 'Rule not found'
            });
        }

        await rule.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
