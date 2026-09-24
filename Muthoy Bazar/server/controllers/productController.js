const Product = require('../models/Product');

// GET /api/products
// Supports: search (q), category, brand, min/max price, sort, page, limit,
// featured, bestSeller, newArrival flags.
exports.getProducts = async (req, res, next) => {
  try {
    console.log("========== GET PRODUCTS ==========");
    console.log("Query:", req.query);

    const {
      q,
      category,
      brand,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 12,
      featured,
      bestSeller,
      newArrival,
    } = req.query;

    const filter = { isActive: true };

    if (q) filter.$text = { $search: q };
    if (category) filter.category = category;
    if (brand) filter.brand = { $in: brand.split(",") };
    if (featured === "true") filter.isFeatured = true;
    if (bestSeller === "true") filter.isBestSeller = true;
    if (newArrival === "true") filter.isNewArrival = true;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    console.log("Filter:", filter);

    let sortOption = { createdAt: -1 };
    if (sort === "price_asc") sortOption = { price: 1 };
    if (sort === "price_desc") sortOption = { price: -1 };
    if (sort === "rating") sortOption = { rating: -1 };
    if (sort === "name_asc") sortOption = { name: 1 };

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const products = await Product.find(filter)
      .populate("category", "name slug")
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    const total = await Product.countDocuments(filter);

    console.log("Total Found:", total);

    res.json({
      success: true,
      count: products.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      products,
    });
  } catch (err) {
    next(err);
  }
};
// GET /api/products/suggestions?q=
exports.getSearchSuggestions = async (req, res, next) => {
  try {
    const { q = '' } = req.query;
    if (!q.trim()) return res.json({ success: true, suggestions: [] });
    const regex = new RegExp(q.trim(), 'i');
    const products = await Product.find({
      isActive: true,
      $or: [{ name: regex }, { brand: regex }],
    })
      .select('name brand slug images price discountPrice')
      .limit(8);
    res.json({ success: true, suggestions: products });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id/related
exports.getRelatedProducts = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true,
    }).limit(4);
    res.json({ success: true, products: related });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/brands
exports.getBrands = async (req, res, next) => {
  try {
    const brands = await Product.distinct('brand', { isActive: true });
    res.json({ success: true, brands: brands.sort() });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/products
exports.createProduct = async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (req.files && req.files.length) {
      body.images = req.files.map((f) => `/uploads/${f.filename}`);
    }
    const product = await Product.create(body);
    res.status(201).json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (req.files && req.files.length) {
      body.images = req.files.map((f) => `/uploads/${f.filename}`);
    }
    const product = await Product.findByIdAndUpdate(req.params.id, body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};
