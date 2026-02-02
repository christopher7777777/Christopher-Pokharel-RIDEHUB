const express = require('express');
const router = express.Router();
const {
    getValuationRules,
    upsertValuationRule,
    deleteValuationRule
} = require('../controllers/valuationController');
const { protect, isAdmin } = require('../middleware/auth');

router.route('/')
    .get(protect, isAdmin, getValuationRules)
    .post(protect, isAdmin, upsertValuationRule);

router.route('/:id')
    .delete(protect, isAdmin, deleteValuationRule);

module.exports = router;
