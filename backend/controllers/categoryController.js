const Category = require('../models/Category');
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
    const categories = await Category.find({});
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
        try {
            if (category.image) {
                const publicId = extractPublicId(category.image);
                if (publicId) await cloudinary.uploader.destroy(publicId);
            }
        } catch (error) {
            console.error('Error deleting image from Cloudinary:', error);
        }

        await category.deleteOne();
        res.json({ message: 'Category removed' });
    } else {
        res.status(404).send('Category not found');
    }
};

module.exports = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
};
