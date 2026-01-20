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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    unit: { type: String, default: 'Piece' },
    tagNumberMode: {
        type: String,
        enum: ['Random', 'Prefix'],
        default: 'Random'
    },
    isMRPItem: { type: Boolean, default: false },
    unitInReports: { type: Boolean, default: true },
    maintainStock: { type: String, default: 'Grams' },
    minTouch: { type: Number, default: 0 },
    maxTouch: { type: Number, default: 0 },
    minStockLevel: { type: Number, default: 0 },
    maxStockLevel: { type: Number, default: 0 },
    preferredVendor: { type: String },
    defaultSalesman: { type: String },
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
