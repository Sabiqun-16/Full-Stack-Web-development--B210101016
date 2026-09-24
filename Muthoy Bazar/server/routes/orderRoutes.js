const router = require('express').Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/orderController');

router.use(protect);
router.post('/', ctrl.createOrder);
router.get('/my', ctrl.getMyOrders);
router.get('/:id', ctrl.getOrder);
router.put('/:id/cancel', ctrl.cancelOrder);

module.exports = router;
