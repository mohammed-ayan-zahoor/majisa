const mongoose = require('mongoose');

const accountGroupSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['Income', 'Expense'],
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    // under field removed as per client request (no nesting)
    code: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    isReserved: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const AccountGroup = mongoose.model('AccountGroup', accountGroupSchema);

module.exports = AccountGroup;
