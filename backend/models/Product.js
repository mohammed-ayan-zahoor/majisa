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
        type: [String],
        required: true,
        default: []
    },
    weight: {
        type: [String],
        required: true,
        default: []
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
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    customFields: [{
        name: { type: String, required: true },
        type: { type: String, required: true, enum: ['text', 'number', 'dropdown'] },
        options: [{ type: String }],
        required: { type: Boolean, default: false }
    }]
}, {
    timestamps: true,
});

// Middleware to handle legacy string data for purity and weight
productSchema.pre('save', function (next) {
    if (this.purity && typeof this.purity === 'string') {
        this.purity = [this.purity];
    }
    if (this.weight && typeof this.weight === 'string') {
        this.weight = [this.weight];
    }
    next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
