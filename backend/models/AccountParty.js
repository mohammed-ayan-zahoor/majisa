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
    address: String,
    phone: String,
    city: String,
    openingBalance: {
        metal: {
            weight: { type: Number, default: 0 },
            type: { type: String, enum: ['Dr', 'Cr'], default: 'Dr' }
        },
        amount: {
            value: { type: Number, default: 0 },
            type: { type: String, enum: ['Dr', 'Cr'], default: 'Dr' }
        }
    }
}, {
    timestamps: true
});

const AccountParty = mongoose.model('AccountParty', accountPartySchema);

module.exports = AccountParty;
