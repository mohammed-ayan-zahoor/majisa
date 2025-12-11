const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'vendor', 'goldsmith', 'customer'],
        default: 'customer',
    },
    phone: {
        type: String,
    },
    // Vendor specific fields
    businessName: String,
    gst: String,
    address: String,
    city: String,
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Active', 'Inactive'],
        default: 'Active'
    },
    // Goldsmith specific fields
    specialization: String,
    activeOrders: {
        type: Number,
        default: 0
    },
    completedOrders: {
        type: Number,
        default: 0
    },
    referralCode: {
        type: String,
        unique: true,
        sparse: true
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, {
    timestamps: true,
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password reset token
userSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire (10 minutes)
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) { // Adjusted to accept next
    if (!this.isModified('password')) {
        next(); // Call next
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;
