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
        enum: ['Asset', 'Liability', 'Income', 'Expense'],
        required: true
    },
    description: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

const AccountGroup = mongoose.model('AccountGroup', accountGroupSchema);

module.exports = AccountGroup;
