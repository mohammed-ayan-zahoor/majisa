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
        // Note: Total Amount might be sum of item amounts + labour, or driven by bhav cutting. 
        // This logic will be handled more robustly in the controller or frontend, 
        // but simple aggregation can happen here.
        const itemsTotal = this.items.reduce((acc, item) => acc + (item.totalAmount || 0), 0);
        // If it's a sales/purchase voucher, the total amount is the financial value attached to the transaction
        if (this.type === 'Sales' || this.type === 'Purchase') {
            // For pure metal accounting, amount might be 0 until rate cut. 
            // But if labour is involved, that's cash.
            // We'll trust the input 'totalAmount' for now or defer to controller.
        }
    }
    next();
});

const Voucher = mongoose.model('Voucher', voucherSchema);

module.exports = Voucher;
