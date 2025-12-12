const express = require('express');
const router = express.Router();
const { loginOrRegister, toggleWishlist, getWishlist } = require('../controllers/customerController');

router.post('/login', loginOrRegister);
router.post('/wishlist/toggle', toggleWishlist);
router.get('/:id/wishlist', getWishlist);

module.exports = router;
