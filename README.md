# Muthoy Bazar — MERN Grocery E-commerce

A complete grocery-only e-commerce application built on MongoDB, Express, React and Node.js.
Fresh vegetables/fruits and all non-grocery categories (art & craft, handmade) have been removed —
this store is groceries and household essentials only, across 40 categories and 100+ seeded products.

## What's implemented

**Frontend (React + React Router + Context API + Axios)**
- Home (hero, categories, featured, best sellers, new arrivals, today's deals, popular brands, reviews, newsletter)
- Shop with category filter, brand filter, price range filter, sort, and pagination
- Live search with dropdown suggestions (by name/brand), full search results page
- Product details: image gallery, quantity selector, Add to Cart, Buy Now, related products, customer reviews + review form
- Cart: update quantity, remove item, apply coupon code, delivery threshold logic, persisted in MongoDB per user
- Checkout: shipping + optional separate billing address, Cash on Delivery / Mobile Banking, order confirmation
- Auth: register, login, logout, JWT stored client-side, protected routes
- Account dashboard: view/edit profile, change password, order history, cancel order
- Admin dashboard: stats (users, products, orders, revenue, low stock, recent orders), full product CRUD (with
  featured/best-seller/new-arrival flags), category CRUD, order status management, user management (role/active toggle, delete)
- Fully responsive layout, same green/white/light-gray visual language as the original static design

**Backend (Node + Express + MongoDB + Mongoose + JWT + bcrypt + Multer)**
- REST API for auth, products, categories, cart, orders, reviews, and admin operations
- JWT auth middleware (`protect`) + role guard (`adminOnly`)
- Password hashing with bcrypt, all inputs validated at the model/controller level
- Multer wired up for product image uploads (`/api/admin/products` accepts `multipart/form-data` with an `images` field);
  the client currently submits image **URLs** for simplicity — swap in a file input calling the same endpoint if you want
  drag-and-drop uploads
- Central error handler, 404 handler, CORS configured for the client origin
- Seeder script that creates an admin account, a demo customer, 40 categories and 105 products

## Two honest notes

1. **Seeded product images are placeholders** (from `placehold.co`), since this environment has no
   network access to source/host real grocery photos. You can replace them per-product in two ways,
   both already wired up in Admin → Products → Edit:
   - **Upload real photos** — use the file picker to upload up to 5 images per product straight from
     your computer (jpg/png/webp, 5MB max each). These go through the Multer endpoint and are served
     from `/uploads/...` on the API.
   - **Paste image URLs** — link to photos already hosted elsewhere (leave the file picker empty).
   Uploading new files replaces the product's current image set on that save; existing images stay
   untouched if you don't pick any new files.
2. **This code has not been run.** It was written and syntax-checked (every `.js`/`.jsx` file
   passes `tsc --noEmit` and Node's own parser with zero errors), but it hasn't been executed end
   to end against a live MongoDB instance, because this sandbox has no network access to install
   dependencies or start Mongo. Please run it locally as below — if anything surfaces during
   `npm install`/first run, it'll most likely be a small dependency-version issue, easy to fix.

## Project structure

```
muthoy-bazar-mern/
  server/            Express API
    config/db.js
    middleware/       auth.js, upload.js, errorHandler.js
    models/           User, Category, Product, Cart, Order, Review
    controllers/
    routes/
    seed/             categories.js, products.js (105 items), seeder.js
    server.js
  client/            React app (Create React App)
    src/
      api/api.js
      context/        AuthContext, CartContext, ToastContext
      components/     Navbar, Footer, ProductCard, Layout, route guards
      pages/          Home, Shop, ProductDetails, Cart, Checkout, Login, Register,
                       Profile, ChangePassword, Orders, Contact, admin/*
      styles/global.css
      assets/logo.png  (your uploaded MB logo)
```

## Setup

### 1. Prerequisites
- Node.js 18+
- A MongoDB instance — either local (`mongod`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### 2. Backend

```bash
cd server
npm install
cp .env.example .env
# edit .env: set MONGO_URI to your MongoDB connection string,
# and set JWT_SECRET to a long random string
npm run seed        # creates categories, 105 products, admin + demo user
npm run dev          # starts the API on http://localhost:5000
```

Seeded logins (printed by the seeder too):
- **Admin:** `admin@muthoybazar.com` / `Admin@12345`
- **Demo customer:** `demo@muthoybazar.com` / `Demo@12345`

### 3. Frontend

```bash
cd client
npm install
cp .env.example .env   # REACT_APP_API_URL=http://localhost:5000/api
npm start                # opens http://localhost:3000
```

The client's `package.json` also has a `"proxy": "http://localhost:5000"` entry, so API calls work
even if you skip the `.env` file in development.

### 4. Try it out
- Browse `/shop`, filter by category/brand/price, search from the navbar
- Register a new account or log in as the demo customer, add items to cart, apply coupon `WELCOME10`, checkout with Cash on Delivery
- Log in as admin, visit `/admin` to see dashboard stats, manage products/categories/orders/users

## Coupon codes (demo)
`WELCOME10` — 10% off. Coupon logic lives in `server/controllers/cartController.js`; in a real
production build this would be its own MongoDB collection with expiry dates and usage limits.

## Extending this further
- Swap placeholder product images for real photography via the Admin → Products form, or wire the
  existing Multer upload endpoint into a file-input UI
- Add payment gateway integration (SSLCommerz/bKash/Stripe) in place of the current
  COD/mobile-banking-on-call flow
- Add pagination to the Admin → Orders/Users tables if your catalog grows much larger
- Add a `.env` value for `CLIENT_URL` in production and lock CORS down accordingly
