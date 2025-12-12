const Customer = require('../models/Customer');
const User = require('../models/User');

// @desc    Login or Register Customer (Mock OTP)
// @route   POST /api/customers/login
// @access  Public
const loginOrRegister = async (req, res) => {
    const { phone, name, referralCode } = req.body;

    try {
        // 1. Verify Referral Code (Vendor exists?)
        // If they are logging in, they might not send referral code again, 
        // but for MVP flow in ReferralGate, we always send it or we check if user exists first.

        let customer = await Customer.findOne({ phone });

        if (!customer) {
            // New Registration
            if (!referralCode || !name) {
                return res.status(400).json({ message: 'Name and Referral Code required for new users.' });
            }

            const vendor = await User.findOne({ referralCode, role: 'vendor' });
            if (!vendor) {
                return res.status(400).json({ message: 'Invalid Referral Code.' });
            }

            customer = await Customer.create({
                name,
                phone,
                referralCode,
                vendor: vendor._id,
                wishlist: []
            });
        }

        // update visit time
        customer.lastVisitedAt = Date.now();
        await customer.save();

        // Populate wishlist
        await customer.populate('wishlist');

        res.json({
            _id: customer._id,
            name: customer.name,
            phone: customer.phone,
            wishlist: customer.wishlist,
            vendorName: (await User.findById(customer.vendor)).name // Send vendor name for UI
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Toggle Wishlist Item
// @route   POST /api/customers/wishlist/toggle
// @access  Public (Protected by context in frontend, but open in backend for now or we pass phone/id)
const toggleWishlist = async (req, res) => {
    const { customerId, productId } = req.body;

    try {
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Check if product exists in wishlist
        const index = customer.wishlist.findIndex(id => id.toString() === productId);

        if (index === -1) {
            // Add
            if (!customer.wishlist.includes(productId)) {
                customer.wishlist.push(productId);
            }
        } else {
            // Remove
            customer.wishlist.splice(index, 1);
        }

        await customer.save();

        // Populate and filter out any nulls (deleted products)
        await customer.populate('wishlist');
        customer.wishlist = customer.wishlist.filter(item => item !== null);

        res.json(customer.wishlist);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Wishlist
// @route   GET /api/customers/:id/wishlist
// @access  Public
const getWishlist = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id).populate('wishlist');
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        // Filter nulls
        const validWishlist = customer.wishlist.filter(item => item !== null);
        res.json(validWishlist);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    loginOrRegister,
    toggleWishlist,
    getWishlist
};
