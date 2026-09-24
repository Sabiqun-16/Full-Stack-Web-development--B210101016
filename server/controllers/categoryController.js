const Category = require('../models/Category');
const Product = require('../models/Product');

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort('name');
    res.json({ success: true, count: categories.length, categories });
  } catch (err) {
    next(err);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, category });
  } catch (err) {
    next(err);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, category });
  } catch (err) {
    next(err);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const inUse = await Product.countDocuments({ category: req.params.id });
    if (inUse > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete: ${inUse} product(s) still use this category`,
      });
    }
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
};
