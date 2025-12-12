const express = require('express');
const router = express.Router();
const {
    authUser,
    registerUser,
    getUserProfile,
    updateUserProfile,
    getUsers,
    updateUserStatus,
    deleteUser,
    createUser,
    updateUser,
    verifyReferral,
    getCustomerVisits,
    getUserById,
    forgotPassword,
    resetPassword,
    updateUserPassword
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', registerUser);
router.post('/login', authUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resetToken', resetPassword);
router.put('/profile/password', protect, updateUserPassword);
router.post('/verify-referral', verifyReferral);

// Wishlist Routes for Users (Vendors)
const { toggleUserWishlist, getUserWishlist } = require('../controllers/userController');
router.post('/wishlist/toggle', protect, toggleUserWishlist);
router.get('/wishlist', protect, getUserWishlist);

router.get('/visits', protect, admin, getCustomerVisits);
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);
router.post('/create', protect, admin, createUser);
router.route('/').get(protect, admin, getUsers);
router.route('/:id')
    .delete(protect, admin, deleteUser)
    .put(protect, admin, updateUser)
    .get(protect, admin, getUserById);
router.route('/:id/status').put(protect, admin, updateUserStatus);

module.exports = router;
