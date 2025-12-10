const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['info', 'warning', 'success', 'error']
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
