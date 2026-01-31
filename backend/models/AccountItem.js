const mongoose = require('mongoose');

const accountItemSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    itemType: {
        type: String,
        enum: ['Goods', 'Service'],
        default: 'Goods'
    },
    metal: {
        type: String,
        default: 'Gold'
    },
    purity: {
        type: Number,
        default: 100
    },
    category: {
        type: String,
        enum: ['Gold', 'Silver', 'Cash'],
        default: 'Gold'
    },
    unit: { type: String, default: 'Piece' },
    minStockLevel: { type: Number, default: 0 },
    // maxStockLevel removed
    defaultWastage: { type: Number, default: 0 },
    laborCharge: { type: Number, default: 0 },
    remarks: { type: String },
    openingStock: {
        weight: { type: Number, default: 0 },
        formattedWeight: { type: String, default: "0.000" } // For display precision
    }
}, {
    timestamps: true
});

const AccountItem = mongoose.model('AccountItem', accountItemSchema);

module.exports = AccountItem;
