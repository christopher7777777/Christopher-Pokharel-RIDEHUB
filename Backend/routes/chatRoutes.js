const express = require('express');
const router = express.Router();
const {
    getOrCreateConversation,
    getMessages,
    saveMessage,
    getMyConversations
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth'); // Assuming protect exists

router.post('/conversation', protect, getOrCreateConversation);
router.get('/conversations', protect, getMyConversations);
router.get('/messages/:conversationId', protect, getMessages);
router.post('/message', protect, saveMessage);

module.exports = router;
