const User = require('../models/User');
const Notification = require('../models/Notification');

const notifyAdmins = async (title, message, type = 'GENERAL', relatedId = null) => {
    try {
        const admins = await User.find({ isAdmin: true });
        const notifications = admins.map(admin => ({
            user: admin._id,
            title,
            message,
            type,
            relatedId
        }));
        if (notifications.length > 0) await Notification.insertMany(notifications);
    } catch (error) {
        console.error('Admin notification failed:', error);
    }
};

module.exports = notifyAdmins;
