const Review = require('../models/Review');
const Product = require('../models/Product');

const recalcProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const { avgRating = 0, count = 0 } = stats[0] || {};
  await Product.findByIdAndUpdate(productId, { rating: avgRating.toFixed(1), numReviews: count });
};

// GET /api/products/:id/reviews
exports.getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.id }).sort('-createdAt');
    res.json({ success: true, count: reviews.length, reviews });
  } catch (err) {
    next(err);
  }
};

// POST /api/products/:id/reviews  { rating, comment }
exports.addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const already = await Review.findOne({ product: req.params.id, user: req.user._id });
    if (already) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    }

    const review = await Review.create({
      product: req.params.id,
      user: req.user._id,
      name: req.user.name,
      rating,
      comment,
    });

    await recalcProductRating(req.params.id);
    res.status(201).json({ success: true, review });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id/reviews/:reviewId
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    const isOwner = review.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }
    await review.deleteOne();
    await recalcProductRating(req.params.id);
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    next(err);
  }
};
