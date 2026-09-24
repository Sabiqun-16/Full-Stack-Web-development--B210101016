const router = require('express').Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/cartController');

router.use(protect);
router.get('/', ctrl.getCart);
router.post('/', ctrl.addToCart);
router.post('/coupon', ctrl.applyCoupon);
router.delete('/', ctrl.clearCart);
router.put('/:productId', ctrl.updateCartItem);
router.delete('/:productId', ctrl.removeCartItem);

module.exports = router;
