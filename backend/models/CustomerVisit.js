const mongoose = require('mongoose');

const customerVisitSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    referralCode: {
        type: String,
        required: true,
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    visitedAt: {
        type: Date,
        default: Date.now,
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('CustomerVisit', customerVisitSchema);
