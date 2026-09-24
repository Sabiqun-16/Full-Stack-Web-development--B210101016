require('dotenv').config();
const mongoose = require('mongoose');
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

  if (process.argv.includes('-d')) {
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

  await Promise.all([
    Category.deleteMany(),
    Product.deleteMany(),
    Cart.deleteMany(),
    Order.deleteMany(),
    Review.deleteMany(),
  ]);

  // Admin + demo user (idempotent)

const adminEmail = 'sabiqun63@gmail.com';

await User.findOneAndDelete({ email: adminEmail });

const admin = await User.create({
  name: 'Sabiqunnahar',
  email: adminEmail,
  password: 'n55974',
  role: 'admin',
  phone: '+8801612633433',
});

  const demoEmail = 'demo@muthoybazar.com';
  let demoUser = await User.findOne({ email: demoEmail });
  if (!demoUser) {
    demoUser = await User.create({
      name: 'Demo Customer',
      email: demoEmail,
      password: 'Demo@12345',
      role: 'user',
      phone: '01739205559',
    });
  }

  const categories = await Category.insertMany(categorySeed);
  const categoryIdByName = categories.reduce((acc, c) => {
    acc[c.name] = c._id;
    return acc;
  }, {});

  const products = buildProducts(categoryIdByName);
  await Product.insertMany(products);

  console.log('--------------------------------------------------');
  console.log(`Seed complete: ${categories.length} categories, ${products.length} products`);
  console.log('Admin login   -> sabiqun63@gmail.com / n55974');
  console.log('Demo customer -> demo@muthoybazar.com / Demo@12345');
  console.log('--------------------------------------------------');
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
