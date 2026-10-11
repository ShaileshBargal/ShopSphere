import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import userRoutes from './routes/userRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import Product from './models/Product.js';
import { seedDatabase } from './seeder/seedData.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB & optionally auto-seed if empty
connectDB().then(async () => {
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('[ShopSphere] No products detected in database. Running initial seed...');
      await seedDatabase();
    }
  } catch (err) {
    console.error('[ShopSphere] Error checking product count for seeding:', err.message);
  }
});

const app = express();

// Middlewares
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow any .onrender.com subdomain
    if (/\.onrender\.com$/.test(origin)) return callback(null, true);
    // Allow any .vercel\.app subdomain
    if (/\.vercel\.app$/.test(origin)) return callback(null, true);
    // Allow any .netlify\.app subdomain
    if (/\.netlify\.app$/.test(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'ShopSphere Multi-Vendor API',
    timestamp: new Date().toISOString(),
  });
});

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/payment', paymentRoutes);

// In production or when frontend/dist exists, serve frontend static files
const frontendDistPath = path.resolve(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  // Any route not starting with /api should serve frontend's index.html
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// Error Handling Middleware (for unhandled /api routes)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[ShopSphere Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

