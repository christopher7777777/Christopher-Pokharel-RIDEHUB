const express = require('express');
const router = express.Router();
const { submitMessage, getMessages, updateMessage } = require('../controllers/messageController');
const { protect, isSeller } = require('../middleware/auth');

router.post('/', submitMessage);
router.get('/', protect, isSeller, getMessages);
router.put('/:id', protect, isSeller, updateMessage);

module.exports = router;
