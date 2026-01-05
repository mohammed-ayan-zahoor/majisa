const Customer = require('../models/Customer');
const User = require('../models/User');
const { createNotification } = require('./notificationController');
const CustomerVisit = require('../models/CustomerVisit');

// @desc    Login or Register Customer (Mock OTP)
// @route   POST /api/customers/login
// @access  Public
const loginOrRegister = async (req, res) => {
    const { phone, name, referralCode } = req.body;

    try {
        // 1. Verify Referral Code (Vendor exists?)
        let vendor;
        if (referralCode) {
            vendor = await User.findOne({ referralCode, role: 'vendor' });
        }

        let customer = await Customer.findOne({ phone });

        if (!customer) {
            // New Registration
            if (!referralCode || !name) {
                return res.status(400).json({ message: 'Name and Referral Code required for new users.' });
            }

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

            // Notify Admin
            await createNotification(
                'info',
                'New Customer Visit',
                `${customer.name} (${customer.phone}) has entered the store via ${vendor.businessName || vendor.name}.`
            );
        }

        // update visit time
        customer.lastVisitedAt = Date.now();
        await customer.save();

        // --- Log Customer Visit (Critical Fix) ---
        // If referral code was provided (gate entry), verify vendor and log visit
        // If logging in without code, we might skip or use customer's original vendor?
        // But logic says referralCode is usually passed from Gate.

        let visitVendor = vendor;
        if (!visitVendor && customer.vendor) {
            // If no code passed (re-login?), use original vendor? 
            // Logic in gate says code is required. So we typically have a vendor.
            // If we don't have a vendor here, we can't log a visit for a specific vendor.
            visitVendor = await User.findById(customer.vendor);
        }

        if (visitVendor) {
            const existingVisit = await CustomerVisit.findOne({
                vendor: visitVendor._id,
                phone: phone, // Match by phone as unique identifier for customer
                // name: name // Name might change or match loosely? Phone is better key.
            });

            if (existingVisit) {
                existingVisit.visitedAt = Date.now();
                existingVisit.name = name || existingVisit.name; // Update name if provided
                existingVisit.referralCode = referralCode || existingVisit.referralCode;
                await existingVisit.save();
            } else {
                await CustomerVisit.create({
                    name: name || customer.name,
                    phone: phone,
                    referralCode: referralCode || customer.referralCode,
                    vendor: visitVendor._id
                });
            }
        }
        // ----------------------------------------

        // Populate wishlist
        await customer.populate('wishlist');

        res.json({
            _id: customer._id,
            name: customer.name,
            phone: customer.phone,
            wishlist: customer.wishlist,
            vendorName: visitVendor ? (visitVendor.businessName || visitVendor.name) : 'Authorized Vendor'
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
