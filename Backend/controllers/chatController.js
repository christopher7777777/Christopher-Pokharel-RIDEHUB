const Conversation = require('../models/Conversation');
const ChatMessage = require('../models/ChatMessage');

// Get or Create Conversation
exports.getOrCreateConversation = async (req, res) => {
    try {
        const { participantId, bikeId } = req.body;
        const myId = req.user.id;
        const bikeContext = bikeId || null;

        let conversation = await Conversation.findOne({
            participants: { $all: [myId, participantId] },
            bikeId: bikeContext
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [myId, participantId],
                bikeId: bikeContext
            });
        }

        res.status(200).json({
            success: true,
            data: conversation
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get Messages for a Conversation
exports.getMessages = async (req, res) => {
    try {
        const messages = await ChatMessage.find({ conversationId: req.params.conversationId })
            .sort({ createdAt: 1 })
            .populate('sender', 'name');

        res.status(200).json({
            success: true,
            data: messages
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Save Message
exports.saveMessage = async (req, res) => {
    try {
        const { conversationId, text } = req.body;
        const senderId = req.user.id;

        const message = await ChatMessage.create({
            conversationId,
            sender: senderId,
            text
        });

        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: text,
            updatedAt: Date.now()
        });

        res.status(201).json({
            success: true,
            data: message
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get All Conversations for User
exports.getMyConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: req.user.id
        })
            .populate('participants', 'name email role')
            .populate('bikeId', 'name price images')
            .sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            data: conversations
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
