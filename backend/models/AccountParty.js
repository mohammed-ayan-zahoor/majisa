const mongoose = require('mongoose');

const accountPartySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AccountGroup',
        required: true
    },
    uniqueName: {
        type: String,
        trim: true
    },
    city: String,
    // Address, PIN, State, Phone, GSTIN, Bank Details removed as per client request
    openingBalance: {
        gold: {
            weight: { type: Number, default: 0 },
            type: { type: String, enum: ['Dr', 'Cr'], default: 'Cr' }
        },
        silver: {
            weight: { type: Number, default: 0 },
            type: { type: String, enum: ['Dr', 'Cr'], default: 'Cr' }
        },
        cash: {
            value: { type: Number, default: 0 },
            type: { type: String, enum: ['Dr', 'Cr'], default: 'Cr' }
        },
        // Legacy fields for compatibility if needed, but primary are gold/silver/cash now
        metal: {
            weight: { type: Number, default: 0 },
            type: { type: String, enum: ['Dr', 'Cr'], default: 'Dr' }
        },
        amount: {
            value: { type: Number, default: 0 },
            type: { type: String, enum: ['Dr', 'Cr'], default: 'Dr' }
        }
    },
    remarks: String,
}, {
    timestamps: true
});

const AccountParty = mongoose.model('AccountParty', accountPartySchema);

module.exports = AccountParty;
