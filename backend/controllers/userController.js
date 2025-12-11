const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// ... (existing generateToken)

// @desc    Forgot Password
// @route   POST /api/users/forgotpassword
// @access  Public
const forgotPassword = async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/resetpassword/${resetToken}`;
    // Note: In production, this should ideally point to the Frontend URL, e.g.
    // const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;
    // But since we are serving frontend from backend in production, logic might hold, 
    // OR we explicitly construct the frontend URL because the link is for the USER to click in email.
    // Let's assume standard frontend route /resetpassword/:token

    const baseUrl = process.env.BASE_URL ||
        (process.env.NODE_ENV === 'production' ? 'https://majisa.co.in' : 'http://localhost:5173');

    const frontendUrl = `${baseUrl}/resetpassword/${resetToken}`;

    const message = `
      <h1>You have requested a password reset</h1>
      <p>Please go to this link to reset your password:</p>
      <a href=${frontendUrl} clicktracking=off>${frontendUrl}</a>
    `;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password Reset Request',
            message,
        });

        res.status(200).json({ success: true, data: 'Email sent' });
    } catch (error) {
        console.log("Email send error: ", error);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        res.status(500).json({ message: `Email failed: ${error.message}` });
    }
};

// @desc    Reset Password
// @route   PUT /api/users/resetpassword/:resetToken
// @access  Public
const resetPassword = async (req, res) => {
    // Get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resetToken)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        res.status(400).json({ message: 'Invalid token' });
        return;
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(201).json({
        success: true,
        data: 'Password updated success',
        token: generateToken(user._id),
    });
};

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).send('Invalid email or password');
    }
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400).send('User already exists');
        return;
    }

    const referralCode = role === 'vendor' ? Math.random().toString(36).substring(2, 8).toUpperCase() : undefined;

    const user = await User.create({
        name,
        email,
        password,
        role: role || 'customer',
        referralCode
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).send('Invalid user data');
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        // Auto-generate referral code for vendors if missing
        if (user.role === 'vendor' && !user.referralCode) {
            user.referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            await user.save();
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            referralCode: user.referralCode,
        });
    } else {
        res.status(404).send('User not found');
    }
};


// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    const { role } = req.query;
    const query = role ? { role } : {};
    const users = await User.find(query);
    res.json(users);
};

// @desc    Update user status
// @route   PUT /api/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.status = req.body.status || user.status;
        const updatedUser = await user.save();
        res.json(updatedUser);
    } else {
        res.status(404).send('User not found');
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        await user.deleteOne();
        res.json({ message: 'User removed' });
    } else {
        res.status(404).send('User not found');
    }
};

// @desc    Create a new user (Admin only)
// @route   POST /api/users/create
// @access  Private/Admin
const createUser = async (req, res) => {
    const { name, email, password, role, businessName, phone, gst } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400).send('User already exists');
        return;
    }

    const referralCode = role === 'vendor' ? Math.random().toString(36).substring(2, 8).toUpperCase() : undefined;

    const user = await User.create({
        name,
        email,
        password,
        role: role || 'vendor', // Default to vendor if created via this admin panel section
        referralCode,
        businessName,
        phone,
        gst,
        status: 'Approved' // Admin created users are auto-approved
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            referralCode: user.referralCode,
        });
    } else {
        res.status(400).send('Invalid user data');
    }
};

// @desc    Update user details (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.role = req.body.role || user.role;
            user.businessName = req.body.businessName || user.businessName;
            user.phone = req.body.phone || user.phone;
            user.gst = req.body.gst || user.gst;
            user.referralCode = req.body.referralCode || user.referralCode;

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                referralCode: updatedUser.referralCode,
            });
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error('Update User Error:', error);
        if (error.code === 11000) {
            res.status(400).send('Email or Referral Code already exists');
        } else {
            res.status(500).send(error.message || 'Server Error');
        }
    }
};

const CustomerVisit = require('../models/CustomerVisit');

// @desc    Verify referral code
// @route   POST /api/users/verify-referral
// @access  Public
const verifyReferral = async (req, res) => {
    const { referralCode, name, phone } = req.body;

    const vendor = await User.findOne({ referralCode, role: 'vendor' });

    if (vendor) {
        // Track the visit if name and phone are provided
        if (name && phone) {
            await CustomerVisit.create({
                name,
                phone,
                referralCode,
                vendor: vendor._id
            });
        }

        res.json({
            valid: true,
            vendorName: vendor.businessName || vendor.name
        });
    } else {
        res.status(404).json({ valid: false, message: 'Invalid referral code' });
    }
};

// @desc    Get all customer visits
// @route   GET /api/users/visits
// @access  Private/Admin
const getCustomerVisits = async (req, res) => {
    const visits = await CustomerVisit.find({}).populate('vendor', 'name businessName').sort({ visitedAt: -1 });
    res.json(visits);
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
        res.json(user);
    } else {
        res.status(404).send('User not found');
    }
};

// @desc    Update user password
// @route   PUT /api/users/profile/password
// @access  Private
const updateUserPassword = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        if (req.body.password) {
            user.password = req.body.password;
            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(400).send('No password provided');
        }
    } else {
        res.status(404).send('User not found');
    }
};

module.exports = {
    authUser,
    registerUser,
    getUserProfile,
    getUsers,
    updateUserStatus,
    deleteUser,
    createUser,
    updateUser,
    verifyReferral,
    getCustomerVisits,
    getUserById,
    forgotPassword,
    resetPassword,
    updateUserPassword
};
