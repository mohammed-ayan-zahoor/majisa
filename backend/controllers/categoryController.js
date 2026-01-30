const Category = require('../models/Category');
const Product = require('../models/Product');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
if (!process.env.CLOUDINARY_URL) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
}

const extractPublicId = (url) => {
    if (!url) return null;
    try {
        const parts = url.split('/');
        const filenameWithExt = parts.pop();
        const folder = parts.pop();
        const publicId = `${folder}/${filenameWithExt.split('.')[0]}`;
        return publicId;
    } catch (error) {
        console.error('Error extracting public ID:', error);
        return null;
    }
};

// @desc    Fetch all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
    const categories = await Category.find({}).sort({ displayOrder: 1 });
    res.json(categories);
};

// @desc    Fetch single category
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (category) {
        res.json(category);
    } else {
        res.status(404).send('Category not found');
    }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
    const { name, description, customFields, image } = req.body;

    const categoryExists = await Category.findOne({ name });

    if (categoryExists) {
        res.status(400).send('Category already exists');
        return;
    }

    const category = await Category.create({
        name,
        description,
        customFields,
        image,
    });

    if (category) {
        res.status(201).json(category);
    } else {
        res.status(400).send('Invalid category data');
    }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
    const { name, description, customFields, image } = req.body;

    const category = await Category.findById(req.params.id);

    if (category) {
        category.name = name;
        category.description = description;
        category.customFields = customFields;
        category.image = image;

        const updatedCategory = await category.save();
        res.json(updatedCategory);
    } else {
        res.status(404).send('Category not found');
    }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (category) {
        // Check if there are any products associated with this category
        const productsCount = await Product.countDocuments({ category: category.name });

        if (productsCount > 0) {
            return res.status(400).send(`Cannot delete category "${category.name}" because it contains ${productsCount} product(s). Please move or delete the products first.`);
        }

        /*
        try {
            if (category.image) {
                const publicId = extractPublicId(category.image);
                if (publicId) await cloudinary.uploader.destroy(publicId);
            }
        } catch (error) {
            console.error('Error deleting image from Cloudinary:', error);
        }
        */

        await category.deleteOne();
        res.json({ message: 'Category removed' });
    } else {
        res.status(404).send('Category not found');
    }
};

// @desc    Move a category up/down/top/bottom
// @route   PUT /api/categories/:id/move
// @access  Private/Admin
const moveCategory = async (req, res) => {
    const { direction } = req.body;

    if (!['up', 'down', 'top', 'bottom'].includes(direction)) {
        return res.status(400).send('Invalid direction. Must be: up, down, top, or bottom');
    }

    const category = await Category.findById(req.params.id);

    if (!category) {
        return res.status(404).send('Category not found');
    }

    const allCategories = await Category.find({}).sort({ displayOrder: 1 });
    const currentIndex = allCategories.findIndex(cat => cat._id.toString() === req.params.id);

    if (currentIndex === -1) {
        return res.status(404).send('Category not found in list');
    }

    try {
        if (direction === 'up' && currentIndex > 0) {
            // Swap with previous item atomically
            const prevCategory = allCategories[currentIndex - 1];
            await Category.bulkWrite([
                {
                    updateOne: {
                        filter: { _id: category._id },
                        update: { $set: { displayOrder: prevCategory.displayOrder } }
                    }
                },
                {
                    updateOne: {
                        filter: { _id: prevCategory._id },
                        update: { $set: { displayOrder: category.displayOrder } }
                    }
                }
            ]);
        }
        else if (direction === 'down' && currentIndex < allCategories.length - 1) {
            // Swap with next item atomically
            const nextCategory = allCategories[currentIndex + 1];
            await Category.bulkWrite([
                {
                    updateOne: {
                        filter: { _id: category._id },
                        update: { $set: { displayOrder: nextCategory.displayOrder } }
                    }
                },
                {
                    updateOne: {
                        filter: { _id: nextCategory._id },
                        update: { $set: { displayOrder: category.displayOrder } }
                    }
                }
            ]);
        }
        else if (direction === 'top' && currentIndex > 0) {
            // Move to top: set to first item's order - 1
            const firstCategory = allCategories[0];
            category.displayOrder = firstCategory.displayOrder - 1;
            await category.save();
        }
        else if (direction === 'bottom' && currentIndex < allCategories.length - 1) {
            // Move to bottom: set to last item's order + 1
            const lastCategory = allCategories[allCategories.length - 1];
            category.displayOrder = lastCategory.displayOrder + 1;
            await category.save();
        }

        res.json({ message: 'Category moved successfully' });
    } catch (error) {
        console.error('Error moving category:', error);
        res.status(500).send('Failed to move category');
    }
};

module.exports = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    moveCategory,
};
