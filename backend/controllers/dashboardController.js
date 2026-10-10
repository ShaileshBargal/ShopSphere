import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Category from '../models/Category.js';

// @desc    Get comprehensive admin dashboard analytics
// @route   GET /api/dashboard/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalProducts = await Product.countDocuments({});
    const totalCategories = await Category.countDocuments({});
    const totalOrders = await Order.countDocuments({});

    // Calculate total revenue from non-cancelled orders
    const revenueAggregation = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } },
    ]);
    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

    // Order status counts
    const statusCounts = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]);

    const orderStatusMap = {
      Pending: 0,
      Processing: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0,
    };
    statusCounts.forEach((item) => {
      if (orderStatusMap[item._id] !== undefined) {
        orderStatusMap[item._id] = item.count;
      }
    });

    // Recent 5 orders
    const recentOrders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Low stock products (countInStock <= 5)
    const lowStockProducts = await Product.find({ countInStock: { $lte: 5 } })
      .select('name price countInStock images vendor')
      .limit(5);

    // Recent products for dashboard display
    const recentProducts = await Product.find({})
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({
      metrics: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalUsers,
        totalCustomers,
        totalCategories,
      },
      orderStatusMap,
      recentOrders,
      lowStockProducts,
      recentProducts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
