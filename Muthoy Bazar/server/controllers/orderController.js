const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { buildSummary } = require('./cartController');

// POST /api/orders  { shippingAddress, billingAddress, paymentMethod }
exports.createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, billingAddress, paymentMethod } = req.body;
    if (!shippingAddress || !shippingAddress.addressLine || !shippingAddress.city) {
      return res.status(400).json({ success: false, message: 'A complete shipping address is required' });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    // Verify stock and build order line items
    const orderItems = [];
    for (const item of cart.items) {
      const product = item.product;
      if (!product || !product.isActive) {
        return res.status(400).json({ success: false, message: `A product in your cart is no longer available` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `${product.name} only has ${product.stock} in stock` });
      }
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0] || '',
        price: item.priceAtAdd,
        quantity: item.quantity,
      });
    }

    const { itemsPrice, discountAmount, deliveryPrice, totalPrice } = buildSummary(cart);

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      billingAddress: billingAddress || { ...shippingAddress, sameAsShipping: true },
      paymentMethod: paymentMethod || 'COD',
      itemsPrice,
      deliveryPrice,
      discountAmount,
      totalPrice,
      couponCode: cart.couponCode,
    });

    // Decrement stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.quantity } });
    }

    // Clear cart
    cart.items = [];
    cart.couponCode = null;
    cart.couponDiscountPercent = 0;
    await cart.save();

    res.status(201).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/my
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/:id
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    const isOwner = order.user._id.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }
    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// PUT /api/orders/:id/cancel
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
    }
    if (['Shipped', 'Delivered'].includes(order.orderStatus)) {
      return res.status(400).json({ success: false, message: `Cannot cancel an order that is already ${order.orderStatus.toLowerCase()}` });
    }
    order.orderStatus = 'Cancelled';
    order.cancelledAt = new Date();
    await order.save();

    // Restock items
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }

    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// ---- Admin ----

// GET /api/admin/orders
exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.orderStatus = status;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email')
        .sort('-createdAt')
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Order.countDocuments(filter),
    ]);
    res.json({ success: true, count: orders.length, total, page: pageNum, pages: Math.ceil(total / limitNum), orders });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/orders/:id/status  { status }
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const valid = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!valid.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status' });
    }
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.orderStatus = status;
    if (status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }
    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};
