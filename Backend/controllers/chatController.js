const Conversation = require('../models/Conversation');
const ChatMessage = require('../models/ChatMessage');
const Payment = require('../models/Payment');

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
        const myId = req.user.id;
        const myRole = req.user.role;

        let conversations = await Conversation.find({
            participants: myId
        })
            .populate('participants', 'name email role')
            .populate('bikeId', 'name price images')
            .sort({ updatedAt: -1 });

        // If seller, only show conversations with users who have completed a payment to this seller
        if (myRole === 'seller') {
            const completedPayments = await Payment.find({
                seller: myId,
                paymentStatus: 'COMPLETED'
            }).distinct('user');

            // Convert ObjectIds to strings for comparison
            const buyerIds = completedPayments.map(id => id.toString());

            conversations = conversations.filter(conv => {
                // Find the OTHER participant (not me)
                const otherParticipant = conv.participants.find(p => p._id.toString() !== myId.toString());
                
                // If there's an other participant, check if they are in the buyer list
                // Also allow conversations with Admins (optional, but usually helpful)
                return otherParticipant && (buyerIds.includes(otherParticipant._id.toString()) || otherParticipant.role === 'admin');
            });
        }

        res.status(200).json({
            success: true,
            data: conversations
        });
    } catch (err) {
        console.error('Get conversations error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};
