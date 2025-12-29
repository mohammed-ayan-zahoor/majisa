const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    deleteProduct,
    updateProduct,
    createProduct,
    getProductByCode,
    getProductsCount,
    getRelatedProducts,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

const { cacheSuccess, clearCache } = require('../middleware/cache');

router.route('/count/total').get(protect, admin, getProductsCount);

router.route('/')
    .get(cacheSuccess, getProducts)
    .post(protect, admin, clearCache, createProduct);

router.route('/:id')
    .get(cacheSuccess, getProductById)
    .put(protect, admin, clearCache, updateProduct)
    .delete(protect, admin, clearCache, deleteProduct);
router.route('/code/:code').get(protect, getProductByCode);
router.route('/:id/related').get(cacheSuccess, getRelatedProducts);

module.exports = router;
