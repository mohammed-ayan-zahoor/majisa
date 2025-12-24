const express = require('express');
const router = express.Router();
const {
    getSettings,
    updateSettings,
    exportBackup,
    importRestore
} = require('../controllers/settingsController');
const { protect, admin } = require('../middleware/authMiddleware');

const { cacheSuccess, clearCache } = require('../middleware/cache');

router.route('/').get(getSettings).put(protect, admin, clearCache, updateSettings);
router.route('/backup').get(protect, admin, exportBackup);
router.route('/restore').post(protect, admin, clearCache, importRestore);

module.exports = router;
