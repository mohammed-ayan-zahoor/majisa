const express = require('express');
const router = express.Router();
const {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    moveCategory,
} = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/authMiddleware');

const { cacheSuccess, clearCache } = require('../middleware/cache');

router.route('/')
    .get(cacheSuccess, getCategories)
    .post(protect, admin, clearCache, createCategory);

router
    .route('/:id')
    .get(cacheSuccess, getCategoryById)
    .put(protect, admin, clearCache, updateCategory)
    .delete(protect, admin, clearCache, deleteCategory);

router
    .route('/:id/move')
    .put(protect, admin, clearCache, moveCategory);

module.exports = router;
