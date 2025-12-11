const express = require('express');
const router = express.Router();
const {
    authUser,
    registerUser,
    getUserProfile,
    getUsers,
    updateUserStatus,
    deleteUser,
    createUser,
    updateUser,
    verifyReferral,
    getCustomerVisits,
    getUserById,
    forgotPassword,
    resetPassword
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', registerUser);
router.post('/login', authUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resetToken', resetPassword);
router.post('/verify-referral', verifyReferral);
router.get('/visits', protect, admin, getCustomerVisits);
router.route('/profile').get(protect, getUserProfile);
router.post('/create', protect, admin, createUser);
router.route('/').get(protect, admin, getUsers);
router.route('/:id')
    .delete(protect, admin, deleteUser)
    .put(protect, admin, updateUser)
    .get(protect, admin, getUserById);
router.route('/:id/status').put(protect, admin, updateUserStatus);

module.exports = router;
