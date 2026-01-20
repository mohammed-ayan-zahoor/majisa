const express = require('express');
const router = express.Router();
const {
    createAccountGroup,
    getAccountGroups,
    createAccountItem,
    getAccountItems,
    createAccountParty,
    getAccountParties,
    createVoucher,
    getVouchers,
    getPartyLedger
} = require('../controllers/accountController');
const { protect, admin } = require('../middleware/authMiddleware');

// Group Routes
router.route('/groups')
    .post(protect, admin, createAccountGroup)
    .get(protect, admin, getAccountGroups);

// Item Routes
router.route('/items')
    .post(protect, admin, createAccountItem)
    .get(protect, admin, getAccountItems);

// Party Routes
router.route('/parties')
    .post(protect, admin, createAccountParty)
    .get(protect, admin, getAccountParties);

// Voucher Routes
router.route('/vouchers')
    .post(protect, admin, createVoucher)
    .get(protect, admin, getVouchers);

// Ledger Routes
router.route('/ledger/:id')
    .get(protect, admin, getPartyLedger);

module.exports = router;
