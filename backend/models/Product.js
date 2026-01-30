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
    views: {
        type: Number,
        default: 0
    },
    sales: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 0
    },
    customFields: [{
        name: { type: String, required: true },
        type: { type: String, required: true, enum: ['text', 'number', 'dropdown', 'color'] },
        options: [{ type: String }],
        required: { type: Boolean, default: false }
    }]
}, {
    timestamps: true,
});

// Middleware to handle legacy string data for purity and weight
// Middleware to handle legacy string data for purity and weight
productSchema.pre('save', async function () {
    if (this.purity && typeof this.purity === 'string') {
        this.purity = [this.purity];
    }
    if (this.weight && typeof this.weight === 'string') {
        this.weight = [this.weight];
    }
});

// Indexes for performance optimization
productSchema.index({ category: 1, isFeatured: -1 }); // Category filtering + featured
productSchema.index({ isNewArrival: -1, createdAt: -1 }); // New arrivals queries
productSchema.index({ views: -1, sales: -1, rating: -1 }); // Ranking algorithm
productSchema.index({ name: 'text', description: 'text' }); // Text search
productSchema.index({ createdAt: -1 }); // Sort by newest

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
