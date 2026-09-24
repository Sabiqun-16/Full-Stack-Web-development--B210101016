const Cart = require('../models/Cart');
const Product = require('../models/Product');

const DELIVERY_FLAT_RATE = 60;
const FREE_DELIVERY_THRESHOLD = 1000;

// Demo coupon table. In production this would be its own model/collection.
const COUPONS = {
  WELCOME10: 10,
  MUTHOY50: 50 > 0 ? 5 : 0, // 5% - kept simple for demo
};

const buildSummary = (cart) => {
  const itemsPrice = cart.items.reduce((sum, i) => sum + i.priceAtAdd * i.quantity, 0);
  const discountAmount = Math.round((itemsPrice * (cart.couponDiscountPercent || 0)) / 100);
  const afterDiscount = itemsPrice - discountAmount;
  const deliveryPrice = afterDiscount >= FREE_DELIVERY_THRESHOLD || afterDiscount === 0 ? 0 : DELIVERY_FLAT_RATE;
  const totalPrice = afterDiscount + deliveryPrice;
  return { itemsPrice, discountAmount, deliveryPrice, totalPrice };
};

const populatedCart = (userId) =>
  Cart.findOne({ user: userId }).populate('items.product', 'name images price discountPrice stock unit');

// GET /api/cart
exports.getCart = async (req, res, next) => {
  try {
    let cart = await populatedCart(req.user._id);
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
    res.json({ success: true, cart, summary: buildSummary(cart) });
  } catch (err) {
    next(err);
  }
};

// POST /api/cart  { productId, quantity }
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Not enough stock available' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    const existing = cart.items.find((i) => i.product.toString() === productId);
    const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.price;
    if (existing) {
      existing.quantity += Number(quantity);
      existing.priceAtAdd = effectivePrice;
    } else {
      cart.items.push({ product: productId, quantity, priceAtAdd: effectivePrice });
    }
    await cart.save();
    cart = await populatedCart(req.user._id);
    res.status(201).json({ success: true, cart, summary: buildSummary(cart) });
  } catch (err) {
    next(err);
  }
};

// PUT /api/cart/:productId  { quantity }
exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const item = cart.items.find((i) => i.product.toString() === req.params.productId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not in cart' });

    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
    } else {
      item.quantity = quantity;
    }
    await cart.save();
    const updated = await populatedCart(req.user._id);
    res.json({ success: true, cart: updated, summary: buildSummary(updated) });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/cart/:productId
exports.removeCartItem = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
    cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
    await cart.save();
    const updated = await populatedCart(req.user._id);
    res.json({ success: true, cart: updated, summary: buildSummary(updated) });
  } catch (err) {
    next(err);
  }
};

// POST /api/cart/coupon  { code }
exports.applyCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;
    const percent = COUPONS[(code || '').toUpperCase()];
    if (!percent) return res.status(400).json({ success: false, message: 'Invalid or expired coupon code' });

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    cart.couponCode = code.toUpperCase();
    cart.couponDiscountPercent = percent;
    await cart.save();
    const updated = await populatedCart(req.user._id);
    res.json({ success: true, cart: updated, summary: buildSummary(updated) });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/cart  (clear cart - used after order placement)
exports.clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [], couponCode: null, couponDiscountPercent: 0 }
    );
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    next(err);
  }
};

exports.buildSummary = buildSummary;
exports.DELIVERY_FLAT_RATE = DELIVERY_FLAT_RATE;
exports.FREE_DELIVERY_THRESHOLD = FREE_DELIVERY_THRESHOLD;
