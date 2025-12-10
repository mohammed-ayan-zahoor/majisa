const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    orderItems: [
        {
            name: { type: String, required: true },
            quantity: { type: Number, required: true },
            image: { type: String },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Product',
            },
            productCode: { type: String },
            size: { type: String },
            purity: { type: String },
            wastage: { type: String },
            customFieldValues: [{
                fieldName: String,
                value: mongoose.Schema.Types.Mixed
            }]
        },
    ],
    shippingAddress: {
        address: { type: String },
        city: { type: String },
        postalCode: { type: String },
        country: { type: String },
    },
    paymentMethod: {
        type: String,
        default: 'COD',
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'In Process', 'Completed', 'Dispatched', 'Delivered'],
        default: 'Pending',
    },
    goldsmith: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Goldsmith is also a User
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Vendor is also a User
    },
    isPaid: {
        type: Boolean,
        default: false,
    },
    paidAt: {
        type: Date,
    },
    isDelivered: {
        type: Boolean,
        default: false,
    },
    deliveredAt: {
        type: Date,
    },
}, {
    timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
