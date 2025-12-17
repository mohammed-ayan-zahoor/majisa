const Settings = require('../models/Settings');

// @desc    Get settings
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res) => {
    const settings = await Settings.findOne();
    if (settings) {
        res.json(settings);
    } else {
        // Create default settings if not exists
        const defaultSettings = await Settings.create({});
        res.json(defaultSettings);
    }
};

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
    const settings = await Settings.findOne();

    if (settings) {
        settings.siteName = req.body.siteName || settings.siteName;
        settings.contactEmail = req.body.contactEmail || settings.contactEmail;
        settings.currency = req.body.currency || settings.currency;
        settings.watermarkLogo = req.body.watermarkLogo !== undefined ? req.body.watermarkLogo : settings.watermarkLogo;
        settings.maintenanceMode = req.body.maintenanceMode !== undefined ? req.body.maintenanceMode : settings.maintenanceMode;

        const updatedSettings = await settings.save();
        res.json(updatedSettings);
    } else {
        // Create if not exists
        const newSettings = await Settings.create(req.body);
        res.json(newSettings);
    }
};

module.exports = {
    getSettings,
    updateSettings
};
