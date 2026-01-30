const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        lowercase: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [30, 'Username cannot exceed 30 characters'],
        match: [/^[a-z0-9_-]+$/, 'Username can only contain lowercase letters, numbers, underscores and hyphens']
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
    state: String,
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
    // Wishlist for Vendors
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    mustChangePassword: {
        type: Boolean,
        default: false
    }
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
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Indexes for performance optimization
userSchema.index({ email: 1 }, { unique: true }); // Login queries
userSchema.index({ role: 1, status: 1 }); // Admin user filtering
userSchema.index({ resetPasswordToken: 1, resetPasswordExpire: 1 }); // Password reset
userSchema.index({ referralCode: 1 }, { unique: true, sparse: true }); // Referral lookups

const User = mongoose.model('User', userSchema);

module.exports = User;
