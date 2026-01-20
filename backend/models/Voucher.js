const mongoose = require('mongoose');

const voucherSchema = mongoose.Schema({
    voucherNo: {
        type: String,
        required: true,
        unique: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    type: {
        type: String,
        enum: ['Sales', 'Purchase', 'Issue', 'Receipt', 'Payment', 'Journal', 'BhavCutting'],
        required: true
    },
    party: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AccountParty',
        required: true
    },
    items: [{
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AccountItem'
        },
        grossWeight: { type: Number, default: 0 },
        lessWeight: { type: Number, default: 0 },
        netWeight: { type: Number, default: 0 },
        purity: { type: Number, default: 0 }, // Touch
        wastage: { type: Number, default: 0 },
        fineWeight: { type: Number, default: 0 },
        labourRate: { type: Number, default: 0 },
        labourAmount: { type: Number, default: 0 },
        totalAmount: { type: Number, default: 0 } // Amount for this item line
    }],
    // Bhav Cutting & Payment Details
    metalRate: { type: Number, default: 0 }, // For converting Metal to Cash
    bhavCuttingWeight: { type: Number, default: 0 }, // Weight converted
    bhavCuttingAmount: { type: Number, default: 0 }, // Amount equivalent

    // Ledger Impacts
    totalFineWeight: { type: Number, default: 0 }, // Total Fine Weight impact
    totalAmount: { type: Number, default: 0 }, // Total Cash Amount impact

    cashReceived: { type: Number, default: 0 }, // Direct cash received/paid in this voucher
    cashAccount: { type: String, default: 'Cash' }, // Could be Bank or Cash

    narration: { type: String, default: '' },

    // Metadata
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Calculate totals before saving
voucherSchema.pre('save', function (next) {
    if (this.items && this.items.length > 0) {
        this.totalFineWeight = this.items.reduce((acc, item) => acc + (item.fineWeight || 0), 0);
    } else {
        this.totalFineWeight = 0;
    }
    next();
});
const Voucher = mongoose.model('Voucher', voucherSchema);

module.exports = Voucher;
