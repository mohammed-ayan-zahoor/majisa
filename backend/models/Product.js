const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    metal: {
        type: String,
        required: true,
    },
    purity: {
        type: String,
        required: true,
    },
    weight: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    images: [{
        type: String,
    }],
    isNewArrival: {
        type: Boolean,
        default: false,
    },
    productCode: {
        type: String,
        required: true,
        unique: true,
    },
    wastage: {
        type: String, // e.g., "12%" or "0.500 g"
        required: true,
    }
}, {
    timestamps: true,
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
