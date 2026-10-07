const Product = require('../models/Product');

const parseImageList = (value) => {
  if (!value) return [];

  try {
    const images = JSON.parse(value);

    return Array.isArray(images)
      ? images.filter(
          (image) => typeof image === 'string' && image.trim()
        )
      : [];
  } catch {
    return [];
  }
};


// =====================================================
// GET /api/products
// Supports:
// search, category, brand, min/max price,
// sort, page, limit,
// featured, bestSeller, newArrival
// =====================================================
exports.getProducts = async (req, res, next) => {
  try {
    const {
      q,
      category,
      brand,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 100,
      featured,
      bestSeller,
      newArrival,
    } = req.query;

    // Only active products
    const filter = {
      isActive: true,
    };

    // Search by product name or brand
    if (q && q.trim()) {
      filter.$or = [
        {
          name: {
            $regex: q.trim(),
            $options: 'i',
          },
        },
        {
          brand: {
            $regex: q.trim(),
            $options: 'i',
          },
        },
      ];
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Brand filter
    if (brand) {
      filter.brand = {
        $in: brand.split(',').map((item) => item.trim()),
      };
    }

    // Featured filter
    if (featured === 'true') {
      filter.isFeatured = true;
    }

    // Best seller filter
    if (bestSeller === 'true') {
      filter.isBestSeller = true;
    }

    // New arrival filter
    if (newArrival === 'true') {
      filter.isNewArrival = true;
    }

    // Price filter
    if (minPrice || maxPrice) {
      filter.price = {};

      if (minPrice) {
        filter.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    // Sorting
    let sortOption = {
      createdAt: -1,
    };

    if (sort === 'price_asc') {
      sortOption = {
        price: 1,
      };
    }

    if (sort === 'price_desc') {
      sortOption = {
        price: -1,
      };
    }

    if (sort === 'rating') {
      sortOption = {
        rating: -1,
      };
    }

    if (sort === 'name_asc') {
      sortOption = {
        name: 1,
      };
    }

    // Pagination
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    // Total products
    const total = await Product.countDocuments(filter);

    // Product list
    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

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


// =====================================================
// GET ADMIN PRODUCTS
// =====================================================
exports.getAdminProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 15,
      q,
      category,
      brand,
    } = req.query;

    const filter = {};

    if (q && q.trim()) {
      filter.$or = [
        {
          name: {
            $regex: q.trim(),
            $options: 'i',
          },
        },
        {
          brand: {
            $regex: q.trim(),
            $options: 'i',
          },
        },
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (brand) {
      filter.brand = {
        $in: brand.split(',').map((item) => item.trim()),
      };
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const allProducts = await Product.find(filter)
      .populate('category', 'name slug')
      .sort({
        isActive: -1,
        updatedAt: -1,
        createdAt: -1,
      });

    // Remove duplicate SKUs
    const seenSkus = new Set();

    const uniqueProducts = allProducts.filter((product) => {
      const key = product.sku
        ? product.sku.trim().toUpperCase()
        : product._id.toString();

      if (seenSkus.has(key)) {
        return false;
      }

      seenSkus.add(key);
      return true;
    });

    const total = uniqueProducts.length;

    const products = uniqueProducts.slice(
      skip,
      skip + limitNum
    );

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


// =====================================================
// GET SEARCH SUGGESTIONS
// /api/products/suggestions?q=rice
// =====================================================
exports.getSearchSuggestions = async (req, res, next) => {
  try {
    const { q = '' } = req.query;

    if (!q.trim()) {
      return res.json({
        success: true,
        suggestions: [],
      });
    }

    const regex = new RegExp(q.trim(), 'i');

    const products = await Product.find({
      isActive: true,
      $or: [
        {
          name: regex,
        },
        {
          brand: regex,
        },
      ],
    })
      .select(
        'name brand slug images price discountPrice'
      )
      .limit(8);

    res.json({
      success: true,
      suggestions: products,
    });
  } catch (err) {
    next(err);
  }
};


// =====================================================
// GET SINGLE PRODUCT
// /api/products/:id
// =====================================================
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(
      req.params.id
    ).populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (err) {
    next(err);
  }
};


// =====================================================
// GET RELATED PRODUCTS
// =====================================================
exports.getRelatedProducts = async (req, res, next) => {
  try {
    const product = await Product.findById(
      req.params.id
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const related = await Product.find({
      category: product.category,
      _id: {
        $ne: product._id,
      },
      isActive: true,
    })
      .populate('category', 'name slug')
      .limit(4);

    res.json({
      success: true,
      products: related,
    });
  } catch (err) {
    next(err);
  }
};


// =====================================================
// GET BRANDS
// =====================================================
exports.getBrands = async (req, res, next) => {
  try {
    const brands = await Product.distinct(
      'brand',
      {
        isActive: true,
      }
    );

    res.json({
      success: true,
      brands: brands.sort(),
    });
  } catch (err) {
    next(err);
  }
};


// =====================================================
// CREATE PRODUCT
// POST /api/products
// =====================================================
exports.createProduct = async (req, res, next) => {
  try {
    const body = {
      ...req.body,
    };

    if (req.files?.length) {
      body.images = [
        ...parseImageList(req.body.existingImages),
        ...parseImageList(req.body.imageUrls),
        ...req.files.map(
          (file) => `/uploads/${file.filename}`
        ),
      ];

      delete body.existingImages;
      delete body.imageUrls;
    }

    const product = await Product.create(body);

    res.status(201).json({
      success: true,
      product,
    });
  } catch (err) {
    next(err);
  }
};


// =====================================================
// UPDATE PRODUCT
// PUT /api/products/:id
// =====================================================
exports.updateProduct = async (req, res, next) => {
  try {
    const body = {
      ...req.body,
    };

    if (req.files?.length) {
      body.images = [
        ...parseImageList(req.body.existingImages),
        ...parseImageList(req.body.imageUrls),
        ...req.files.map(
          (file) => `/uploads/${file.filename}`
        ),
      ];

      delete body.existingImages;
      delete body.imageUrls;
    }

    const product =
      await Product.findByIdAndUpdate(
        req.params.id,
        body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (err) {
    next(err);
  }
};


// =====================================================
// DELETE PRODUCT
// DELETE /api/products/:id
// =====================================================
exports.deleteProduct = async (req, res, next) => {
  try {
    const product =
      await Product.findByIdAndDelete(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};
