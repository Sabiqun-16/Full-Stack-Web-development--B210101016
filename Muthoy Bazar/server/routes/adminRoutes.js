const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');
const adminCtrl = require('../controllers/adminController');
const productCtrl = require('../controllers/productController');
const orderCtrl = require('../controllers/orderController');
const categoryCtrl = require('../controllers/categoryController');

router.use(protect, adminOnly);

router.get('/dashboard', adminCtrl.getDashboardStats);

router.get('/users', adminCtrl.getUsers);
router.put('/users/:id', adminCtrl.updateUser);
router.delete('/users/:id', adminCtrl.deleteUser);

router.post('/products', upload.array('images', 5), productCtrl.createProduct);
router.put('/products/:id', upload.array('images', 5), productCtrl.updateProduct);
router.delete('/products/:id', productCtrl.deleteProduct);

router.post('/categories', categoryCtrl.createCategory);
router.put('/categories/:id', categoryCtrl.updateCategory);
router.delete('/categories/:id', categoryCtrl.deleteCategory);

router.get('/orders', orderCtrl.getAllOrders);
router.put('/orders/:id/status', orderCtrl.updateOrderStatus);

module.exports = router;
