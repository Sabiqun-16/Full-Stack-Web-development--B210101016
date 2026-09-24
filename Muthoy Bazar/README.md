# Muthoy Bazar

Muthoy Bazar is a full-stack grocery and household-essentials e-commerce application built with the MERN stack. Customers can browse products, search and filter the catalog, manage a persistent cart, place orders, submit reviews, and manage their account. Administrators can manage the catalog, categories, orders, and users from a protected dashboard.

## 1. Project Overview

### Main technologies

| Layer | Technology |
| --- | --- |
| Frontend | React 18, React Router 6, Context API, Axios, Create React App |
| Backend | Node.js, Express 4, Mongoose 8 |
| Database | MongoDB |
| Authentication | JWT and bcryptjs |
| File uploads | Multer |
| Validation and utilities | express-validator, slugify, dotenv, CORS, Morgan |

### Main capabilities

- Grocery-only product catalog with categories and brands
- Product search, suggestions, category/brand/price filtering, sorting, and pagination
- Product details, image gallery, related products, ratings, and reviews
- Registration, login, logout, profile editing, and password change
- JWT-protected customer account, cart, checkout, and order history
- Persistent cart and order data stored in MongoDB
- Coupon support with the demo code `WELCOME10`
- Cash on Delivery and Mobile Banking order methods
- Admin dashboard with statistics and recent-order information
- Admin CRUD for products and categories
- Admin order-status management
- Admin user management, role changes, active/inactive status, and deletion
- Responsive customer and admin interfaces

## 2. Repository Structure

```text
Muthoy Bazar/
├── client/
│   ├── public/
│   │   ├── images/                 Static site images
│   │   └── products/               Product images served by the API
│   ├── src/
│   │   ├── api/api.js              Axios instance and JWT interceptor
│   │   ├── assets/                 Frontend assets
│   │   ├── components/             Layout, navbar, footer, cards, route guards
│   │   ├── context/                Auth, cart, and toast state providers
│   │   ├── pages/                  Customer pages
│   │   │   └── admin/               Admin dashboard pages
│   │   ├── styles/global.css        Global responsive styling
│   │   ├── App.js                   Routes and application providers
│   │   └── index.js                 React entry point
│   ├── .env.example
│   └── package.json
├── server/
│   ├── config/db.js                MongoDB connection
│   ├── controllers/                Business logic for each domain
│   ├── middleware/                 JWT, roles, uploads, and errors
│   ├── models/                     Mongoose schemas
│   ├── routes/                     Express route definitions
│   ├── seed/                       Categories, products, and demo users
│   ├── uploads/                    Uploaded product images
│   ├── .env.example
│   ├── server.js                   API entry point
│   └── package.json
└── README.md
```

## 3. Application URLs

### Customer frontend

| URL | Purpose | Access |
| --- | --- | --- |
| `/` | Home page | Public |
| `/shop` | Product catalog | Public |
| `/product/:id` | Product details and reviews | Public |
| `/cart` | Cart contents | Public UI, cart actions require login |
| `/checkout` | Shipping, billing, and payment selection | Authenticated |
| `/login` | Login | Public |
| `/register` | Account registration | Public |
| `/profile` | Profile and saved addresses | Authenticated |
| `/profile/password` | Change password | Authenticated |
| `/orders` | Customer order history | Authenticated |
| `/admin` | Admin dashboard | Admin only |
| `/admin/products` | Product management | Admin only |
| `/admin/categories` | Category management | Admin only |
| `/admin/orders` | Order management | Admin only |
| `/admin/users` | User management | Admin only |

### Backend base URL

The API runs on `http://localhost:5000` by default. The health endpoint is:

```text
GET /api/health
```

## 4. API Reference

All protected requests must send:

```http
Authorization: Bearer <jwt-token>
```

### Authentication and profile

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Create a customer account |
| POST | `/api/auth/login` | Public | Authenticate and receive a JWT |
| POST | `/api/auth/logout` | Public | Client-side logout response |
| GET | `/api/auth/profile` | User | Read current profile |
| PUT | `/api/auth/profile` | User | Update profile and addresses |
| PUT | `/api/auth/change-password` | User | Change password |

### Catalog and reviews

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/products` | Public | List products with search/filter/sort options |
| GET | `/api/products/suggestions` | Public | Search suggestions |
| GET | `/api/products/brands` | Public | List available brands |
| GET | `/api/products/:id` | Public | Read one product |
| GET | `/api/products/:id/related` | Public | Read related products |
| GET | `/api/products/:id/reviews` | Public | Read product reviews |
| POST | `/api/products/:id/reviews` | User | Add a review |
| DELETE | `/api/products/:id/reviews/:reviewId` | User | Delete an owned review |
| GET | `/api/categories` | Public | List categories |

### Cart and orders

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/cart` | User | Read the current user's cart |
| POST | `/api/cart` | User | Add a product to the cart |
| PUT | `/api/cart/:productId` | User | Update item quantity |
| DELETE | `/api/cart/:productId` | User | Remove one item |
| DELETE | `/api/cart` | User | Clear the cart |
| POST | `/api/cart/coupon` | User | Apply a coupon |
| POST | `/api/orders` | User | Create an order from the cart |
| GET | `/api/orders/my` | User | List the user's orders |
| GET | `/api/orders/:id` | User | Read one permitted order |
| PUT | `/api/orders/:id/cancel` | User | Cancel an eligible order |

### Admin API

Every endpoint below requires both a valid JWT and `role: admin`.

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/admin/dashboard` | Dashboard statistics |
| GET | `/api/admin/users` | List users |
| PUT | `/api/admin/users/:id` | Update role or active status |
| DELETE | `/api/admin/users/:id` | Delete a user |
| POST | `/api/admin/products` | Create a product; accepts up to five `images` files |
| PUT | `/api/admin/products/:id` | Update a product and optional images |
| DELETE | `/api/admin/products/:id` | Delete a product |
| POST | `/api/admin/categories` | Create a category |
| PUT | `/api/admin/categories/:id` | Update a category |
| DELETE | `/api/admin/categories/:id` | Delete a category |
| GET | `/api/admin/orders` | List all orders |
| PUT | `/api/admin/orders/:id/status` | Update order status |

Product CRUD is also exposed through the corresponding protected routes under `/api/products`.

## 5. Database Models

- **User**: name, email, hashed password, phone, role, addresses, and active status.
- **Category**: grocery category name, slug, image, and active status.
- **Product**: name, slug, brand, category, description, images, price, discount price, stock, SKU, weight, unit, rating, and merchandising flags.
- **Cart**: user-owned product items, quantities, and the selected coupon.
- **Order**: customer, order items, shipping/billing addresses, payment method, price summary, coupon, order status, and delivery/payment flags.
- **Review**: product, user, rating, comment, and timestamps.

Product units are restricted to `g`, `kg`, `ml`, `l`, `pcs`, `pack`, and `dozen`. Order statuses are `Pending`, `Processing`, `Shipped`, `Delivered`, and `Cancelled`.

## 6. Local Setup

### Prerequisites

- Node.js 18 or later
- npm
- A running MongoDB instance, local or MongoDB Atlas

### Quick start after cloning from GitHub

From inside the `Muthoy Bazar` folder, run:

```bash
npm run setup
```

This installs both client and server dependencies and creates `client/.env` and `server/.env` from their example files when they do not already exist. Open `server/.env` and set a working `MONGO_URI` plus a strong `JWT_SECRET` before continuing.

Load the development catalog and start both applications with:

```bash
npm run seed
npm run dev
```

The API runs at `http://localhost:5000` and the frontend runs at `http://localhost:3000`. Stop both processes with `Ctrl+C`.

### Start the backend

```bash
cd server
npm install
```

Copy `server/.env.example` to `server/.env` and set a real MongoDB URI and a long random JWT secret:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/muthoy_bazar
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

Seed development data, then start the server:

```bash
npm run seed
npm run dev
```

Available server scripts:

| Command | Purpose |
| --- | --- |
| `npm start` | Start with Node |
| `npm run dev` | Start with Nodemon |
| `npm run seed` | Recreate seeded categories, products, carts, orders, and reviews; create seed users |
| `npm run seed:destroy` | Delete all seeded database data, including users |

The root convenience commands are `npm run setup`, `npm run seed`, `npm run dev`, and `npm run build`. The separate client/server commands below are useful when running or deploying only one part of the application.

### Start the frontend

In a second terminal:

```bash
cd client
npm install
```

Copy `client/.env.example` to `client/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the React app:

```bash
npm start
```

The frontend opens at `http://localhost:3000`. In development, the client package also proxies API requests to port 5000.

## 7. Seed Data and Demo Testing

`npm run seed` creates the admin account, demo customer, grocery categories, and the seeded product catalog. The exact seed credentials are printed in the server terminal when seeding completes. These credentials are for local development only and must be changed or removed before deployment.

Suggested smoke test:

1. Open the home page and verify category/product data loads.
2. Search for a product and test category, brand, price, sorting, and pagination controls.
3. Register or use the demo customer account.
4. Add products to the cart, update quantities, and apply `WELCOME10`.
5. Complete checkout using COD or Mobile Banking.
6. Open order history and test cancellation where allowed.
7. Log in as admin and verify dashboard, product, category, order, and user management.

## 8. Business Rules

- Delivery is free when the post-discount subtotal is at least BDT 1,000.
- Otherwise, delivery is charged at a flat BDT 60.
- The demo coupon `WELCOME10` gives 10% off and is implemented in `server/controllers/cartController.js`.
- The effective product price uses `discountPrice` when it is greater than zero; otherwise it uses `price`.
- Customers can only access their own cart and orders.
- Admin endpoints require both authentication and the admin role.
- Product image uploads accept up to five files per request through the `images` field. Uploaded files are served from `/uploads`.

## 9. Security and Deployment Notes

- Never commit `.env` files, production JWT secrets, database credentials, or real payment credentials.
- Replace every development seed password before production use.
- Use HTTPS in production and configure a production frontend origin in CORS.
- Set a strong, unique `JWT_SECRET` and review token expiry for the deployment environment.
- Add rate limiting, stricter request validation, security headers, and production logging before exposing the API publicly.
- The current logout flow is stateless: the client removes the JWT. Token revocation/blacklisting is not implemented.
- The current Mobile Banking option records the selected method but does not process an online payment gateway transaction.
- Use real product images instead of placeholder URLs before launch.
- Configure persistent storage and backup policies for MongoDB and `server/uploads`.

## 10. Troubleshooting

### MongoDB connection error

Confirm that MongoDB is running and that `MONGO_URI` is valid. The server exits when the initial database connection fails.

### Unauthorized or expired token

Log in again. The client removes `mb_token` and `mb_user` from local storage after a 401 response.

### Images do not load

Check that the image URL is valid, the `server/uploads` directory is writable for uploads, and the API is running on the URL configured by the client.

### Port already in use

Change `PORT` in `server/.env`, update `REACT_APP_API_URL`, and update the client proxy if the development setup requires it.

## 11. Future Improvements

- Integrate SSLCommerz, bKash, Stripe, or another verified payment gateway.
- Move coupons into a database collection with expiry, usage limits, and per-user rules.
- Add automated frontend and backend tests, API contract tests, and CI checks.
- Add pagination and advanced filters to admin user/order tables.
- Add email/SMS order notifications and delivery tracking.
- Add image optimization, cloud storage, and CDN delivery.
- Add audit logs for administrative actions.

## 12. GitHub, Vercel, and Backend Deployment

The React client is ready for Vercel. The current Express server is a long-running Node process, so deploy the frontend and backend as separate services:

### Push the project to GitHub

Commit and push the repository, including the new `client/vercel.json` file. Do not push either `client/.env` or `server/.env`.

### Deploy the frontend to Vercel

1. Open Vercel and select **Add New Project**.
2. Import the GitHub repository.
3. Set **Root Directory** to `Muthoy Bazar/client` when the repository contains the outer project folder. If the GitHub repository itself starts at `Muthoy Bazar`, use `client` instead.
4. Use these project settings:

	```text
	Framework Preset: Create React App
	Build Command: npm run build
	Output Directory: build
	Install Command: npm install
	```

5. Add the Vercel environment variable:

	```text
	REACT_APP_API_URL=https://<your-backend-domain>/api
	```

6. Deploy. The included `client/vercel.json` keeps React Router URLs such as `/shop` and `/admin` working after a page refresh.

### Deploy the backend

Use a Node-compatible host such as Render, Railway, or Fly.io. For a Render Web Service, use:

```text
Root Directory: Muthoy Bazar/server
Build Command: npm install
Start Command: npm start
```

Add these backend environment variables in the hosting provider:

```text
NODE_ENV=production
PORT=5000
MONGO_URI=<your MongoDB Atlas connection string>
JWT_SECRET=<a long random production secret>
JWT_EXPIRES_IN=7d
CLIENT_URL=https://<your-vercel-project>.vercel.app
```

After the backend is live, verify `https://<your-backend-domain>/api/health`, put that domain into Vercel's `REACT_APP_API_URL`, and redeploy the frontend. If the Vercel project has more than one allowed origin, separate them with commas in `CLIENT_URL`.

### Production checklist

- Create the MongoDB Atlas database and allow the backend host's network access.
- Run the seed command once from a secure backend shell only if initial catalog data is required: `npm run seed`.
- Change or remove all seeded development credentials.
- Replace placeholder product images and configure persistent upload storage.
- Confirm that browser requests to the backend do not fail with CORS errors.
- Keep payment gateway keys and all `.env` values in hosting-provider secret settings.

## License

No license file is currently included in this repository. Add a license before distributing the project publicly.
