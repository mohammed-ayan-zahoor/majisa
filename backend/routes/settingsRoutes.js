const express = require('express');
const router = express.Router();
const {
    getSettings,
    updateSettings,
    exportBackup,
    importRestore
} = require('../controllers/settingsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(getSettings).put(protect, admin, updateSettings);
router.route('/backup').get(protect, admin, exportBackup);
router.route('/restore').post(protect, admin, importRestore);

module.exports = router;
