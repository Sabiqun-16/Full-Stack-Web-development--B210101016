const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');
const ctrl = require('../controllers/productController');
const reviewCtrl = require('../controllers/reviewController');

router.get('/', ctrl.getProducts);
router.get('/suggestions', ctrl.getSearchSuggestions);
router.get('/brands', ctrl.getBrands);
router.get('/:id', ctrl.getProduct);
router.get('/:id/related', ctrl.getRelatedProducts);

router.get('/:id/reviews', reviewCtrl.getProductReviews);
router.post('/:id/reviews', protect, reviewCtrl.addReview);
router.delete('/:id/reviews/:reviewId', protect, reviewCtrl.deleteReview);

// Admin product management (also reachable under /api/admin/products)
router.post('/', protect, adminOnly, upload.array('images', 5), ctrl.createProduct);
router.put('/:id', protect, adminOnly, upload.array('images', 5), ctrl.updateProduct);
router.delete('/:id', protect, adminOnly, ctrl.deleteProduct);

module.exports = router;
