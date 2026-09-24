const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const ctrl = require('../controllers/categoryController');

router.get('/', ctrl.getCategories);
router.post('/', protect, adminOnly, ctrl.createCategory);
router.put('/:id', protect, adminOnly, ctrl.updateCategory);
router.delete('/:id', protect, adminOnly, ctrl.deleteCategory);

module.exports = router;
