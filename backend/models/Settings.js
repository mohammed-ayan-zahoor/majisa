const mongoose = require('mongoose');

const settingsSchema = mongoose.Schema({
    siteName: {
        type: String,
        required: true,
        default: 'Majisa Jewellers'
    },
    contactEmail: {
        type: String,
        required: true,
        default: 'admin@majisa.com'
    },
    currency: {
        type: String,
        required: true,
        default: 'INR'
    },
    maintenanceMode: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
