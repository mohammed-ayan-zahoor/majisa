const AccountGroup = require('../models/AccountGroup');
const AccountItem = require('../models/AccountItem');
const AccountParty = require('../models/AccountParty');
const Voucher = require('../models/Voucher');

// @desc    Create a new account group
// @route   POST /api/accounts/groups
// @access  Private/Admin
const createAccountGroup = async (req, res) => {
    try {
        const { name, type, description } = req.body;

        const groupExists = await AccountGroup.findOne({ name });
        if (groupExists) {
            return res.status(400).json({ message: 'Account Group already exists' });
        }

        const group = await AccountGroup.create({
            name,
            type,
            description
        });

        res.status(201).json(group);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all account groups
// @route   GET /api/accounts/groups
// @access  Private/Admin
const getAccountGroups = async (req, res) => {
    try {
        const groups = await AccountGroup.find({});
        res.json(groups);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new account item
// @route   POST /api/accounts/items
// @access  Private/Admin
const createAccountItem = async (req, res) => {
    try {
        const { name, metal, purity, defaultWastage, openingStock } = req.body;

        const itemExists = await AccountItem.findOne({ name });
        if (itemExists) {
            return res.status(400).json({ message: 'Account Item already exists' });
        }

        const item = await AccountItem.create({
            name,
            metal,
            purity,
            defaultWastage,
            openingStock
        });

        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all account items
// @route   GET /api/accounts/items
// @access  Private/Admin
const getAccountItems = async (req, res) => {
    try {
        const items = await AccountItem.find({});
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new account party
// @route   POST /api/accounts/parties
// @access  Private/Admin
const createAccountParty = async (req, res) => {
    try {
        const { name, group, address, phone, city, openingBalance } = req.body;

        const partyExists = await AccountParty.findOne({ name });
        if (partyExists) {
            return res.status(400).json({ message: 'Account Party already exists' });
        }

        const party = await AccountParty.create({
            name,
            group,
            address,
            phone,
            city,
            openingBalance
        });

        res.status(201).json(party);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all account parties
// @route   GET /api/accounts/parties
// @access  Private/Admin
const getAccountParties = async (req, res) => {
    try {
        const parties = await AccountParty.find({}).populate('group', 'name type');
        res.json(parties);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new account voucher (Sales/Purchase/Issue/Receipt)
// @route   POST /api/accounts/vouchers
// @access  Private/Admin
const createVoucher = async (req, res) => {
    try {
        const {
            voucherNo,
            date,
            type,
            party,
            items,
            metalRate,
            bhavCuttingWeight,
            bhavCuttingAmount,
            cashReceived,
            cashAccount,
            narration
        } = req.body;

        // 1. Validate User
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        // 2. Validate Party
        if (!party) {
            return res.status(400).json({ message: 'Party is required' });
        }
        const partyExists = await AccountParty.findById(party);
        if (!partyExists) {
            return res.status(400).json({ message: 'Invalid Party selected' });
        }

        // 3. Validate Voucher No Uniqueness
        const voucherExists = await Voucher.findOne({ voucherNo });
        if (voucherExists) {
            return res.status(400).json({ message: `Voucher No '${voucherNo}' already exists` });
        }

        // 4. Validate Items
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Voucher must contain at least one item' });
        }

        // Check if all items exist in AccountItem collection
        const itemIds = items.map(i => i.item);
        const uniqueItemIds = [...new Set(itemIds.map(id => id.toString()))];
        const validItems = await AccountItem.find({ _id: { $in: uniqueItemIds } });
        if (validItems.length !== uniqueItemIds.length) {
            return res.status(400).json({ message: 'One or more selected items are invalid' });
        }
        const voucher = await Voucher.create({
            voucherNo,
            date,
            type,
            party,
            items,
            metalRate,
            bhavCuttingWeight,
            bhavCuttingAmount,
            cashReceived,
            cashAccount,
            narration,
            createdBy: req.user._id
        });

        res.status(201).json(voucher);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all vouchers
// @route   GET /api/accounts/vouchers
// @access  Private/Admin
const getVouchers = async (req, res) => {
    try {
        const vouchers = await Voucher.find({})
            .populate('party', 'name')
            .populate('items.item', 'name metal')
            .sort({ date: -1 });
        res.json(vouchers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Get Ledger for a Party
// @route   GET /api/accounts/ledger/:id
// @access  Private/Admin
const getPartyLedger = async (req, res) => {
    try {
        const partyId = req.params.id;
        const party = await AccountParty.findById(partyId);

        if (!party) {
            return res.status(404).json({ message: 'Party not found' });
        }

        // Fetch all vouchers for this party
        const vouchers = await Voucher.find({ party: partyId }).sort({ date: 1 });

        // Calculate running balance (simplified logic for now)
        // Ideally this should be done with aggregations or detailed logic on frontend
        // Here we just return the raw vouchers and let frontend compute the running balance

        res.json({
            party,
            transactions: vouchers
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createAccountGroup,
    getAccountGroups,
    createAccountItem,
    getAccountItems,
    createAccountParty,
    getAccountParties,
    createVoucher,
    getVouchers,
    getPartyLedger
};
