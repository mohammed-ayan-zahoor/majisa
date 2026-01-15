const mongoose = require('mongoose');
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
        const pageSize = Number(req.query.limit) || 20;
        const page = Number(req.query.page) || 1;

        const keyword = req.query.keyword
            ? {
                $or: [
                    { name: { $regex: req.query.keyword, $options: 'i' } },
                    { productCode: { $regex: req.query.keyword, $options: 'i' } }
                ]
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

        // Only use Discovery Mode (Randomization) if explicitly requested and on page 1 with no filters
        const isDiscoveryMode = req.query.discovery === 'true' && page === 1 && !req.query.keyword && (!req.query.category || req.query.category === 'All') && !req.query.minPrice && !req.query.maxPrice && !req.query.newArrival;

        const count = await Product.countDocuments({ ...keyword, ...category, ...priceFilter, ...newArrivalFilter });

        let products;

        if (isDiscoveryMode && count > pageSize) {
            // Smart Mix Logic for Page 1:
            // 4 Newest + (pageSize - 4) Random from the rest
            const newestProducts = await Product.find({ ...keyword, ...category, ...priceFilter, ...newArrivalFilter })
                .sort({ isFeatured: -1, createdAt: -1 })
                .limit(4);

            const newestIds = newestProducts.map(p => p._id);

            // Get random products excluding the newest ones
            const randomProducts = await Product.aggregate([
                { $match: { _id: { $nin: newestIds }, ...keyword, ...category, ...priceFilter, ...newArrivalFilter } },
                { $sample: { size: pageSize - 4 } }
            ]);

            products = [...newestProducts, ...randomProducts];
        } else {
            // Amazon-style Weighted Ranking Engine
            // Score = (Featured * 30) + (New * 20) + (Views * 0.15) + (Sales * 0.20) + (Rating * 25)
            products = await Product.aggregate([
                { $match: { ...keyword, ...category, ...priceFilter, ...newArrivalFilter } },
                {
                    $addFields: {
                        score: {
                            $add: [
                                { $multiply: [{ $cond: ["$isFeatured", 1, 0] }, 30] },     // Featured Boost
                                { $multiply: [{ $cond: ["$isNewArrival", 1, 0] }, 20] },   // Freshness Boost
                                { $multiply: [{ $ifNull: ["$views", 0] }, 0.15] },          // Popularity (Views)
                                { $multiply: [{ $ifNull: ["$sales", 0] }, 0.20] },          // Performance (Sales)
                                { $multiply: [{ $ifNull: ["$rating", 0] }, 25] }            // Quality (Rating)
                            ]
                        }
                    }
                },
                { $sort: { score: -1, createdAt: -1 } }, // Primary sort by Score, Fallback to Newest
                { $skip: pageSize * (page - 1) },
                { $limit: pageSize }
            ]);
        }

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
    // Use findByIdAndUpdate to atomic increment views
    const product = await Product.findByIdAndUpdate(
        req.params.id,
        { $inc: { views: 1 } },
        { new: true } // Return updated document
    );

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
        /* 
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
        */

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
    try {
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
            wastage,
            customFields,
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
            customFields,
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        console.error('Create Product Error:', error);
        if (error.code === 11000) {
            return res.status(400).json({
                message: `Product Code "${req.body.productCode}" already exists. Please use a unique code.`,
            });
        }
        res.status(500).json({ message: error.message || 'Failed to create product' });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    try {
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
            wastage,
            isFeatured,
            customFields,
        } = req.body;

        const product = await Product.findById(req.params.id);

        if (product) {
            product.name = name || product.name;
            product.price = price !== undefined ? price : product.price;
            product.description = description || product.description;
            product.image = image || product.image;
            product.images = images || product.images;
            product.category = category || product.category;
            product.metal = metal || product.metal;
            product.purity = purity || product.purity;
            product.weight = weight || product.weight;
            product.isNewArrival = isNewArrival !== undefined ? isNewArrival : product.isNewArrival;
            product.productCode = productCode || product.productCode;
            product.wastage = wastage || product.wastage;
            product.isFeatured = isFeatured !== undefined ? isFeatured : product.isFeatured;
            product.customFields = customFields || product.customFields;

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error('Update Product Error:', error);
        if (error.code === 11000) {
            return res.status(400).json({
                message: `Product Code "${req.body.productCode}" is already taken by another product.`,
            });
        }
        res.status(500).json({ message: error.message || 'Failed to update product' });
    }
};

// @desc    Get total products count
// @route   GET /api/products/count/total
// @access  Private/Admin
const getProductsCount = async (req, res) => {
    try {
        const count = await Product.countDocuments({});
        res.json({ count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
const getRelatedProducts = async (req, res) => {
    try {
        const { id } = req.params;
        const limit = Number(req.query.limit) || 8;

        // First, get the current product
        const currentProduct = await Product.findById(id);

        if (!currentProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Calculate price range (±30% of current product price)
        const priceMin = (currentProduct.price || 0) * 0.7;
        const priceMax = (currentProduct.price || 0) * 1.3;

        // Strategy: Get related products using weighted scoring
        const relatedProducts = await Product.aggregate([
            {
                $match: {
                    _id: { $ne: new mongoose.Types.ObjectId(id) },
                    $or: [
                        // Primary: Same category
                        { category: currentProduct.category },
                        // Secondary: Same metal type
                        { metal: currentProduct.metal },
                        // Tertiary: Similar price range
                        { price: { $gte: priceMin, $lte: priceMax } }
                    ]
                }
            },
            {
                $addFields: {
                    relevanceScore: {
                        $add: [
                            // Category match gets highest priority
                            { $cond: [{ $eq: ['$category', currentProduct.category] }, 40, 0] },
                            // Metal match
                            { $cond: [{ $eq: ['$metal', currentProduct.metal] }, 20, 0] },
                            // Price similarity (within range)
                            {
                                $cond: [
                                    {
                                        $and: [
                                            { $gte: ['$price', priceMin] },
                                            { $lte: ['$price', priceMax] }
                                        ]
                                    },
                                    15,
                                    0
                                ]
                            },
                            // Product quality signals
                            { $multiply: [{ $cond: ['$isFeatured', 1, 0] }, 10] },
                            { $multiply: [{ $ifNull: ['$rating', 0] }, 8] },
                            { $multiply: [{ $ifNull: ['$sales', 0] }, 0.05] },
                            { $multiply: [{ $ifNull: ['$views', 0] }, 0.02] },
                            // Slight bonus for new arrivals
                            { $cond: ['$isNewArrival', 5, 0] }
                        ]
                    }
                }
            },
            { $sort: { relevanceScore: -1, createdAt: -1 } },
            { $limit: limit },
            {
                $project: {
                    name: 1,
                    category: 1,
                    metal: 1,
                    price: 1,
                    image: 1,
                    productCode: 1,
                    isNewArrival: 1,
                    isFeatured: 1,
                    rating: 1
                }
            }
        ]);

        // Fallback: If we have fewer than 4 related products, add some random popular ones
        if (relatedProducts.length < 4) {
            const additionalProducts = await Product.aggregate([
                {
                    $match: {
                        _id: {
                            $nin: [
                                new mongoose.Types.ObjectId(id),
                                ...relatedProducts.map(p => p._id)
                            ]
                        }
                    }
                },
                { $sample: { size: limit - relatedProducts.length } },
                {
                    $project: {
                        name: 1,
                        category: 1,
                        metal: 1,
                        price: 1,
                        image: 1,
                        productCode: 1,
                        isNewArrival: 1,
                        isFeatured: 1,
                        rating: 1
                    }
                }
            ]);

            relatedProducts.push(...additionalProducts);
        }

        res.json(relatedProducts);
    } catch (error) {
        console.error('Related Products Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getProducts,
    getProductById,
    deleteProduct,
    createProduct,
    updateProduct,
    getProductByCode,
    getProductsCount,
    getRelatedProducts,
};
