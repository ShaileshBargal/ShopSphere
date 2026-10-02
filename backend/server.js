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
app.use(cors());
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

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/payment', paymentRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[ShopSphere Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
