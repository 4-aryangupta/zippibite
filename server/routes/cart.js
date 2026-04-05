const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCart, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getCart);
router.post('/add', addToCart);
router.put('/update', updateCart);
router.delete('/clear', clearCart);

module.exports = router;
