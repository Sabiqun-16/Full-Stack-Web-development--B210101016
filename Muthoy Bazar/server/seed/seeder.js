require('dotenv').config();
const connectDB = require('../config/db');

const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Review = require('../models/Review');

const categorySeed = require('./categories');
const { buildProducts } = require('./products');

const run = async () => {
  await connectDB();

  // NEVER delete existing data during normal seeding.
  // Destructive mode is available only with: node seed/seeder.js -d
  if (process.argv.includes('-d')) {
    console.log('WARNING: Destructive mode enabled.');

    await Promise.all([
      User.deleteMany(),
      Category.deleteMany(),
      Product.deleteMany(),
      Cart.deleteMany(),
      Order.deleteMany(),
      Review.deleteMany(),
    ]);

    console.log('All data destroyed.');
    return process.exit(0);
  }

  // --------------------------------------------------
  // ADMIN USER
  // --------------------------------------------------

  const adminEmail = 'sabiqun63@gmail.com';

  let admin = await User.findOne({ email: adminEmail });

  if (!admin) {
    await User.create({
      name: 'Sabiqunnahar',
      email: adminEmail,
      password: 'n55974',
      role: 'admin',
      phone: '+8801612633433',
    });

    console.log('Admin user created.');
  } else {
    console.log('Admin user already exists. Keeping it.');
  }

  // --------------------------------------------------
  // DEMO USER
  // --------------------------------------------------

  const demoEmail = 'demo@muthoybazar.com';

  let demoUser = await User.findOne({ email: demoEmail });

  if (!demoUser) {
    await User.create({
      name: 'Demo Customer',
      email: demoEmail,
      password: 'Demo@12345',
      role: 'user',
      phone: '01739205559',
    });

    console.log('Demo customer created.');
  } else {
    console.log('Demo customer already exists. Keeping it.');
  }

  // --------------------------------------------------
  // CATEGORIES
  // --------------------------------------------------

  const categoryIdByName = {};

  for (const categoryData of categorySeed) {
    let category = await Category.findOne({
      name: categoryData.name,
    });

    if (!category) {
      category = await Category.create(categoryData);
      console.log(`Category created: ${category.name}`);
    } else {
      console.log(`Category already exists: ${category.name}`);
    }

    categoryIdByName[category.name] = category._id;
  }

  // --------------------------------------------------
  // PRODUCTS
  // --------------------------------------------------

  const products = buildProducts(categoryIdByName);

  let createdProducts = 0;
  let existingProducts = 0;

  for (const productData of products) {
    const existingProduct = await Product.findOne({
      sku: productData.sku,
    });

    if (!existingProduct) {
      await Product.create(productData);
      createdProducts++;
      console.log(`Product created: ${productData.name}`);
    } else {
      existingProducts++;
      console.log(`Product already exists: ${productData.name}`);
    }
  }

  // --------------------------------------------------
  // SUMMARY
  // --------------------------------------------------

  console.log('--------------------------------------------------');
  console.log('Seed process completed safely.');
  console.log(`Products created: ${createdProducts}`);
  console.log(`Products already existed: ${existingProducts}`);
  console.log('Existing products were NOT deleted.');
  console.log('Existing categories were NOT deleted.');
  console.log('--------------------------------------------------');

  process.exit(0);
};

run().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});