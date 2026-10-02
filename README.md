# ShopSphere - Multi-Vendor MERN Stack E-Commerce Platform

A production-ready, full-featured multi-vendor e-commerce application built with the **MERN** stack (MongoDB, Express, React, Node.js). It features two dedicated modules: **Customer Module** and **Admin Module**, with role-based access control, real-time database persistence, multi-vendor product attribution, live search/filtering/sorting, cart management, interactive multi-step checkout, and visual order tracking.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **MongoDB** (Local MongoDB on `mongodb://127.0.0.1:27017/shopsphere` OR MongoDB Atlas URI. *Note: If no MongoDB server is running, the app automatically falls back to an embedded in-memory MongoDB instance for instant plug-and-play testing!*)

### 1. Install Dependencies
You can install dependencies for all modules from the project root:
```bash
# In the root directory:
npm run install:all
```
Or separately:
```bash
# Backend:
cd backend && npm install

# Frontend:
cd frontend && npm install
```

### 2. Configure Environment Variables
- Backend: A `.env` file is already created in `backend/.env`.
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/shopsphere
JWT_SECRET=shopsphere_super_secret_jwt_key_2026_xyz
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
```

### 3. Seed Sample Multi-Vendor Data
To seed realistic multi-vendor products, categories, sample orders, and demo accounts:
```bash
npm run seed --prefix backend
```
*(The backend also automatically seeds the database on its very first start if it detects an empty database!)*

### 4. Run the Application
You can run both Backend and Frontend concurrently with one command:
```bash
npm run dev
```
Or run each separately in separate terminal tabs:
- **Backend API**: `npm run dev --prefix backend` (Runs at [http://localhost:5000](http://localhost:5000))
- **Frontend App**: `npm run dev --prefix frontend` (Runs at [http://localhost:5173](http://localhost:5173))

---

## 🔑 Demo Login Credentials

You can test both modules immediately using either the **1-Click Demo Login** buttons on `/login` or entering credentials manually:

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@shopsphere.com` | `admin123` | Full access to `/admin` Dashboard, Product CRUD, Categories, Orders management & User role management |
| **Customer** | `customer@shopsphere.com` | `customer123` | Browsing, Search, Cart, Checkout, Order Placement, Profile, Order History |

---

## 🧩 Architectural Implementation Details

```
Shopsphere/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection with in-memory fallback
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, profile updates
│   │   ├── productController.js  # Catalog queries, search, multi-faceted filtering, Admin CRUD
│   │   ├── categoryController.js # Department/Category management
│   │   ├── orderController.js    # Stock deduction, checkout, customer & admin order handling
│   │   ├── userController.js     # Admin user listing & role upgrades
│   │   └── dashboardController.js# Platform analytics, revenue aggregation, stock alerts
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification & Admin RBAC
│   │   └── errorMiddleware.js    # Centralized error handler & Mongoose CastError sanitizer
│   ├── models/
│   │   ├── User.js               # Customers and Admins with bcrypt password hashing
│   │   ├── Category.js           # Categories with slugs and icons
│   │   ├── Product.js            # Multi-vendor products with pricing, stock, rating, and seller info
│   │   └── Order.js              # Order items, shipping address, payment status, fulfillment state
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── userRoutes.js
│   │   └── dashboardRoutes.js
│   ├── seeder/
│   │   └── seedData.js           # 12+ multi-vendor products, 5 categories, sample orders, demo accounts
│   ├── server.js                 # Express server entrypoint
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosInstance.js  # Axios with Bearer token injection and 401 handling
│   │   ├── components/
│   │   │   ├── common/           # Navbar, Footer, Modal, StatusBadge, RatingStars, ProtectedRoute
│   │   │   ├── customer/         # ProductCard, FilterSidebar, OrderTimeline
│   │   │   └── admin/            # AdminSidebar, AdminStatCard
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # Global user state & JWT authentication methods
│   │   │   └── CartContext.jsx   # Global cart state, stock validation, and live pricing calculation
│   │   ├── pages/
│   │   │   ├── customer/         # Home, Products, ProductDetail, Cart, Checkout, OrderDetail, Profile, Login, Register
│   │   │   └── admin/            # Dashboard, Products Management, Categories, Orders, Users
│   │   ├── App.jsx               # Route definitions & layout switches
│   │   ├── main.jsx              # React DOM render with Context providers
│   │   └── index.css             # Tailwind CSS styling & custom scrollbar
│   ├── vite.config.js            # Vite configuration with API proxy
│   └── package.json
│
└── package.json                  # Root runner script
```

---

## 🌟 Feature Checklist

### 1. Customer Module
- [x] **User Authentication**: Register, Login with JWT, persistent session in `localStorage`.
- [x] **Browse Products**: Responsive grid with hover effects, discount badges, and vendor labels.
- [x] **Search Products**: Real-time keyword search across title, description, brand, and vendor store names.
- [x] **Filter & Sort Products**:
  - Filter by Category (All or specific category slug).
  - Filter by Maximum Price range slider ($10 - $1,000+).
  - Filter by Minimum Customer Rating (4★, 3★, 2★ & up).
  - In-Stock Only filter toggle.
  - Sort by Newest, Price (Low to High), Price (High to Low), Highest Rated, Most Popular.
- [x] **Product Details**: Multi-image preview, price/discount, stock availability indicator, detailed merchant information card ("Sold by ... • 4.9 ★"), quantity selector, tabbed sections for overview, seller policy, and customer reviews.
- [x] **Shopping Cart**:
  - Add to cart with quantity validation against stock limits.
  - Update quantities (+/-) or remove items.
  - Free shipping progress bar (Free shipping over $150).
  - Dynamic subtotal, estimated tax (8%), shipping, and total calculation.
- [x] **Checkout Flow**:
  - Multi-step address form (pre-filled from profile).
  - Payment method selection: Cash on Delivery (COD), Credit/Debit Card (simulated approval), PayPal.
- [x] **Place Orders & Tracking**:
  - Order confirmation with generated ID.
  - Visual status progress timeline (`Pending` $\rightarrow$ `Processing` $\rightarrow$ `Shipped` $\rightarrow$ `Delivered`).
  - Online simulated payment trigger for pending orders.
- [x] **User Profile & Order History**:
  - View and update personal information (name, email, phone, password).
  - Manage default shipping address.
  - Interactive table of past orders with status badges and "View Details" links.

### 2. Admin Module (Role-Protected at `/admin/*`)
- [x] **Admin Authentication**: Role-based access control (`role: 'admin'`). Customers attempting to visit `/admin` are redirected.
- [x] **Admin Analytics Dashboard**:
  - Total Revenue, Total Orders, Active Products, and Registered Users metric cards.
  - Order pipeline status breakdown (Pending, Processing, Shipped, Delivered, Cancelled).
  - Recent orders table with fast status changer dropdown.
  - Low inventory stock warning list.
- [x] **Product Management**:
  - Full product table with search and category filters.
  - **Add Product Modal**: Specify title, price, compare price, category, stock count, image URL, vendor name, store name, brand, description, and featured flag.
  - **Update Product Modal**: Edit any product details in place.
  - **Delete Product**: With confirmation prompt.
- [x] **Category Management**:
  - View all categories with slug and number of assigned products.
  - Add new category with cover image and description.
  - Edit existing category.
  - Delete category (protected against deleting categories that currently have products).
- [x] **Order Management**:
  - View all customer orders across the platform.
  - Filter orders by status (All, Pending, Processing, Shipped, Delivered, Cancelled).
  - Update fulfillment status directly.
  - Toggle Paid / Unpaid status with one click.
- [x] **User Management**:
  - View all registered customers and admins.
  - Upgrade/downgrade roles (Customer $\leftrightarrow$ Admin).
  - Delete user accounts (with safeguards against deleting oneself).

---

## 📡 REST API Reference Summary

| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/api/health` | `GET` | Public | Healthcheck and server status |
| `/api/auth/register` | `POST` | Public | Register customer account |
| `/api/auth/login` | `POST` | Public | Authenticate user & receive JWT token |
| `/api/auth/profile` | `GET`, `PUT` | Private (Auth) | View or update logged-in user profile |
| `/api/products` | `GET` | Public | List products with query filters (search, category, price, sort, page) |
| `/api/products/:id` | `GET` | Public | Get single product by ID |
| `/api/products` | `POST` | Private (Admin) | Create new product |
| `/api/products/:id` | `PUT`, `DELETE` | Private (Admin) | Update or remove product |
| `/api/categories` | `GET` | Public | List categories with product counts |
| `/api/categories` | `POST`, `PUT`, `DELETE` | Private (Admin) | Create, edit, or delete category |
| `/api/orders` | `POST` | Private (Auth) | Place order & reduce inventory count |
| `/api/orders/myorders` | `GET` | Private (Auth) | Get logged-in user order history |
| `/api/orders/:id` | `GET` | Private (Auth) | View order tracking & details |
| `/api/orders` | `GET` | Private (Admin) | Get all platform orders |
| `/api/orders/:id/status` | `PUT` | Private (Admin) | Update order status and payment status |
| `/api/dashboard/stats` | `GET` | Private (Admin) | Aggregate revenue, orders, and low-stock alerts |
| `/api/users` | `GET` | Private (Admin) | List all registered users |
| `/api/users/:id/role` | `PUT` | Private (Admin) | Update user role |
| `/api/users/:id` | `DELETE` | Private (Admin) | Delete user |

---

## 📄 License
This project is open-source and available under the ISC License.
