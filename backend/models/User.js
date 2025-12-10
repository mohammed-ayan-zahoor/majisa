const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
        sparse: true // Allows null/undefined values to not conflict
    }
}, {
    timestamps: true,
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;
