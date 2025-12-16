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
        // Example: https://res.cloudinary.com/cloudname/image/upload/v1234567890/majisa_products/image_name.jpg
        const parts = url.split('/');
        const filenameWithExt = parts.pop();
        const folder = parts.pop(); // majisa_products
        const publicId = `${folder}/${filenameWithExt.split('.')[0]}`;
        return publicId;
    } catch (error) {
        console.error('Error extracting public ID:', error);
        return null;
    }
};

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const pageSize = Number(req.query.limit) || 12;
        const page = Number(req.query.page) || 1;

        const keyword = req.query.keyword
            ? {
                name: {
                    $regex: req.query.keyword,
                    $options: 'i',
                },
            }
            : {};

        const category = req.query.category && req.query.category !== 'All'
            ? { category: req.query.category }
            : {};

        const priceFilter = {};
        if (req.query.minPrice || req.query.maxPrice) {
            priceFilter.price = {};
            if (req.query.minPrice) priceFilter.price.$gte = Number(req.query.minPrice);
            if (req.query.maxPrice) priceFilter.price.$lte = Number(req.query.maxPrice);
        }

        const newArrivalFilter = req.query.newArrival === 'true' ? { isNewArrival: true } : {};

        const count = await Product.countDocuments({ ...keyword, ...category, ...priceFilter, ...newArrivalFilter });
        const products = await Product.find({ ...keyword, ...category, ...priceFilter, ...newArrivalFilter })
            .sort({ createdAt: -1 }) // Sort by newest first
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.json({ products, page, pages: Math.ceil(count / pageSize), total: count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Fetch single product by code
// @route   GET /api/products/code/:code
// @access  Private (Vendor only)
const getProductByCode = async (req, res) => {
    const product = await Product.findOne({ productCode: req.params.code });

    if (product) {
        res.json(product);
    } else {
        res.status(404).send('Product not found');
    }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        res.json(product);
    } else {
        res.status(404).send('Product not found');
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        try {
            // Delete main image
            if (product.image) {
                const publicId = extractPublicId(product.image);
                if (publicId) await cloudinary.uploader.destroy(publicId);
            }

            // Delete multiple images
            if (product.images && product.images.length > 0) {
                for (const imgUrl of product.images) {
                    const publicId = extractPublicId(imgUrl);
                    if (publicId) await cloudinary.uploader.destroy(publicId);
                }
            }
        } catch (error) {
            console.error('Error deleting images from Cloudinary:', error);
            // Continue to delete product even if image deletion fails
        }

        await product.deleteOne();
        res.json({ message: 'Product removed' });
    } else {
        res.status(404).send('Product not found');
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    const {
        name,
        price,
        description,
        image,
        images,
        category,
        metal,
        purity,
        weight,
        isNewArrival,
        productCode,
        wastage
    } = req.body;

    const product = new Product({
        name,
        price,
        user: req.user._id,
        image,
        images,
        category,
        metal,
        purity,
        weight,
        isNewArrival,
        description,
        productCode,
        wastage,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    const {
        name,
        price,
        description,
        image,
        images,
        category,
        metal,
        purity,
        weight,
        isNewArrival,
        productCode,
        wastage
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        product.name = name;
        product.price = price;
        product.description = description;
        product.image = image;
        product.images = images;
        product.category = category;
        product.metal = metal;
        product.purity = purity;
        product.weight = weight;
        product.isNewArrival = isNewArrival;
        product.productCode = productCode;
        product.wastage = wastage;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404).send('Product not found');
    }
};

module.exports = {
    getProducts,
    getProductById,
    deleteProduct,
    createProduct,
    updateProduct,
    getProductByCode,
};
