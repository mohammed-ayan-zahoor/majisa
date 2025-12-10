const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    deleteProduct,
    updateProduct,
    createProduct,
    getProductByCode,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(getProducts).post(protect, admin, createProduct);
router.route('/:id').get(getProductById).put(protect, admin, updateProduct).delete(protect, admin, deleteProduct);
router.route('/code/:code').get(protect, getProductByCode);

module.exports = router;
