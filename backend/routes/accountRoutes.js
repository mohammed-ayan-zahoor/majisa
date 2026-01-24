const express = require('express');
const router = express.Router();
const {
    createAccountGroup,
    getAccountGroups,
    updateAccountGroup,
    deleteAccountGroup,
    createAccountItem,
    getAccountItems,
    updateAccountItem,
    deleteAccountItem,
    createAccountParty,
    getAccountParties,
    updateAccountParty,
    deleteAccountParty,
    createVoucher,
    getVouchers,
    getPartyLedger
} = require('../controllers/accountController');
const { protect, admin } = require('../middleware/authMiddleware');

// Group Routes
router.route('/groups')
    .post(protect, admin, createAccountGroup)
    .get(protect, admin, getAccountGroups);

router.route('/groups/:id')
    .put(protect, admin, updateAccountGroup)
    .delete(protect, admin, deleteAccountGroup);

// Item Routes
router.route('/items')
    .post(protect, admin, createAccountItem)
    .get(protect, admin, getAccountItems);

router.route('/items/:id')
    .put(protect, admin, updateAccountItem)
    .delete(protect, admin, deleteAccountItem);

// Party Routes
router.route('/parties')
    .post(protect, admin, createAccountParty)
    .get(protect, admin, getAccountParties);

router.route('/parties/:id')
    .put(protect, admin, updateAccountParty)
    .delete(protect, admin, deleteAccountParty);

// Voucher Routes
router.route('/vouchers')
    .post(protect, admin, createVoucher)
    .get(protect, admin, getVouchers);

// Ledger Routes
router.route('/ledger/:id')
    .get(protect, admin, getPartyLedger);

module.exports = router;
