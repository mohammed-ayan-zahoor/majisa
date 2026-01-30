const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    image: {
        type: String,
        required: false,
    },
    description: {
        type: String,
    },
    displayOrder: {
        type: Number,
        default: 0,
    },
    customFields: [{
        name: { type: String, required: true },
        type: { type: String, required: true, enum: ['text', 'number', 'dropdown', 'color'] },
        options: [{ type: String }], // For dropdowns
        required: { type: Boolean, default: false }
    }]
}, {
    timestamps: true,
});

// Indexes for performance optimization
categorySchema.index({ name: 1 }, { unique: true }); // Unique category names
categorySchema.index({ displayOrder: 1 }); // For custom ordering feature

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
