# 🛍️ ShopSphere — Multi-Vendor E-Commerce Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Render-00c7b7?style=for-the-badge&logo=render&logoColor=white)](https://shopsphere-1-1ilk.onrender.com)

ShopSphere is a full-featured online shopping website where customers can browse and buy products from multiple sellers, and admins can manage the whole store from an admin dashboard.

---

## 🌐 Live Website

- **Link:** [https://shopsphere-1-1ilk.onrender.com](https://shopsphere-1-1ilk.onrender.com)

---

## 🔑 Demo Login Accounts

You can test the website using these ready-to-use accounts:

| Role | Email | Password | What You Can Do |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@shopsphere.com` | `admin123` | Full access to Admin Dashboard, add/edit/delete products, manage orders, view revenue |
| **Customer** | `customer@shopsphere.com` | `customer123` | Browse catalog, search, add to cart & wishlist, checkout, view order tracking |

---

## ✨ Main Features

### 👤 For Customers:
- **Responsive Design:** Looks great on mobile phones, tablets, and computers.
- **Search & Filter:** Find products by name, category, price range, and star rating.
- **Wishlist & Cart:** Save favorite items and manage cart items with stock limits.
- **Easy Checkout:** Enter delivery address and choose payment method (COD, Card, PayPal, Razorpay).
- **Order Tracking:** Track your order status (Pending → Processing → Shipped → Delivered).
- **Forgot Password with Email OTP:** Reset your password using a 6-digit verification code sent directly to your email.

### 🛠️ For Admin:
- **Dashboard Overview:** View total sales, total orders, product count, and user count.
- **Product Management:** Add new items, update prices, change stock, or delete items.
- **Category Management:** Create and organize product categories with cover images.
- **Order Management:** View all incoming orders and update delivery/payment status.
- **User Management:** View registered users and manage user roles.

---

## 🧰 Technologies Used

- **Frontend:** React, Vite, Tailwind CSS, Lucide Icons
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **Email Service:** Resend API (for OTP password reset)
- **Hosting:** Render

---

## 💻 How to Run Locally on Your Computer

### 1. Clone the project
```bash
git clone https://github.com/ShaileshBargal/ShopSphere.git
cd ShopSphere
```

### 2. Install all dependencies
```bash
npm run install:all
```

### 3. Setup Environment Variables
Create a file named `.env` inside the `backend` folder with this content:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=ShopSphere <onboarding@resend.dev>
```

### 4. Add Sample Data (Optional)
```bash
npm run seed
```

### 5. Start the Project
```bash
npm run dev
```

- Open **[http://localhost:5173](http://localhost:5173)** in your browser for the website.
- The backend API runs on **[http://localhost:5000](http://localhost:5000)**.

---

## 👨‍💻 Created By

**Shailesh Bargal**
