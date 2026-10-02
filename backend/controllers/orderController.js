import Order from '../models/Order.js';
import Product from '../models/Product.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const addOrderItems = async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ message: 'No order items specified' });
  }

  // Verify stock availability & decrement stock for each product
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) {
      return res.status(404).json({ message: `Product ${item.name} was not found` });
    }
    if (product.countInStock < item.qty) {
      return res.status(400).json({
        message: `Insufficient stock for ${product.name}. Available: ${product.countInStock}`,
      });
    }
    // Decrement stock
    product.countInStock -= item.qty;
    await product.save();
  }

  const order = new Order({
    orderItems,
    user: req.user._id,
    shippingAddress,
    paymentMethod: paymentMethod || 'Cash on Delivery',
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    orderStatus: 'Pending',
    isPaid: paymentMethod === 'Credit Card' || paymentMethod === 'PayPal',
    paidAt: paymentMethod === 'Credit Card' || paymentMethod === 'PayPal' ? Date.now() : null,
  });

  const createdOrder = await order.save();
  res.status(201).json(createdOrder);
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('orderItems.product', 'name images price');

  if (order) {
    // Only allow customer who placed it or an admin
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }
    res.json(order);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  const pageSize = Number(req.query.limit) || 20;
  const page = Number(req.query.page) || 1;
  const status = req.query.status;

  const query = {};
  if (status && status !== 'all') {
    query.orderStatus = status;
  }

  const count = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate('user', 'id name email')
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    orders,
    page,
    pages: Math.ceil(count / pageSize),
    totalOrders: count,
  });
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  const { status, isPaid } = req.body;
  const order = await Order.findById(req.params.id);

  if (order) {
    if (status) {
      order.orderStatus = status;
      if (status === 'Delivered') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        // If cash on delivery and delivered, mark as paid
        if (!order.isPaid) {
          order.isPaid = true;
          order.paidAt = Date.now();
        }
      }
    }

    if (isPaid !== undefined) {
      order.isPaid = Boolean(isPaid);
      if (order.isPaid && !order.paidAt) {
        order.paidAt = Date.now();
      }
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id || `PAY-${Date.now()}`,
      status: req.body.status || 'COMPLETED',
      update_time: req.body.update_time || new Date().toISOString(),
      email_address: req.body.payer ? req.body.payer.email_address : req.user.email,
    };

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};
