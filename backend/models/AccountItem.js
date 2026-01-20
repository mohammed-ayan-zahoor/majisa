const mongoose = require('mongoose');

const accountItemSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    metal: {
        type: String, // e.g., 'Gold', 'Silver', 'Other'
        required: true,
        default: 'Gold'
    },
    purity: {
        type: Number, // e.g., 99.50, 91.60
        required: true,
        default: 100
    },
    defaultWastage: {
        type: Number, // Percentage or fixed value logic can be handled in controller
        default: 0
    },
    openingStock: {
        weight: { type: Number, default: 0 },
        formattedWeight: { type: String, default: "0.000" } // For display precision
    }
}, {
    timestamps: true
});

const AccountItem = mongoose.model('AccountItem', accountItemSchema);

module.exports = AccountItem;
