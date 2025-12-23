const Settings = require('../models/Settings');
const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const CustomerVisit = require('../models/CustomerVisit');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

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

// @desc    Export full database backup
// @route   GET /api/settings/backup
// @access  Private/Admin
const exportBackup = async (req, res) => {
    try {
        const backupData = {
            products: await Product.find({}),
            categories: await Category.find({}),
            backupDate: new Date().toISOString(),
            version: '2.0'
        };

        res.set({
            'Content-Disposition': `attachment; filename="majisa_backup_${new Date().toISOString().split('T')[0]}.json"`,
            'Content-Type': 'application/json'
        });
        res.send(JSON.stringify(backupData, null, 2));
    } catch (error) {
        console.error('Backup Error:', error);
        res.status(500).json({ message: 'Backup failed' });
    }
};

// @desc    Import/Restore full database backup
// @route   POST /api/settings/restore
// @access  Private/Admin
const importRestore = async (req, res) => {
    try {
        const { backupData } = req.body;

        if (!backupData || !backupData.products || !backupData.categories) {
            throw new Error('Invalid backup file format');
        }

        // Clear existing scoped data (Products and Categories only)
        await Product.deleteMany({});
        await Category.deleteMany({});

        // Restore scoped data
        if (backupData.products) await Product.insertMany(backupData.products);
        if (backupData.categories) await Category.insertMany(backupData.categories);

        res.json({ message: 'Database restored successfully (Products & Categories).' });
    } catch (error) {
        console.error('Restore Error:', error);
        res.status(500).json({ message: error.message || 'Restore failed' });
    }
};

module.exports = {
    getSettings,
    updateSettings,
    exportBackup,
    importRestore
};
