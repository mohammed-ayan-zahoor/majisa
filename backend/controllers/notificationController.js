const Notification = require('../models/Notification');

// @desc    Get all notifications
// @route   GET /api/notifications
// @access  Private/Admin
const getNotifications = async (req, res) => {
    const notifications = await Notification.find({}).sort({ createdAt: -1 });
    res.json(notifications);
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private/Admin
const markAsRead = async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (notification) {
        notification.read = true;
        const updatedNotification = await notification.save();
        res.json(updatedNotification);
    } else {
        res.status(404);
        throw new Error('Notification not found');
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private/Admin
const markAllAsRead = async (req, res) => {
    await Notification.updateMany({}, { read: true });
    res.json({ message: 'All notifications marked as read' });
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private/Admin
const deleteNotification = async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (notification) {
        await notification.deleteOne();
        res.json({ message: 'Notification removed' });
    } else {
        res.status(404);
        throw new Error('Notification not found');
    }
};

// @desc    Create a notification (Internal use)
const createNotification = async (type, title, message) => {
    try {
        await Notification.create({ type, title, message });
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification
};
