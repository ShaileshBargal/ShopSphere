import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_TidkjXnW6H5Yn4',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'D8ozNijp8ANk3g5FTA4FT8Xx',
  });
};

// @desc    Create a Razorpay order (amount in paise)
// @route   POST /api/payment/razorpay/create-order
// @access  Private
router.post('/razorpay/create-order', protect, async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid payment amount' });
    }

    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      payment_capture: 1,
    };

    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create(options);
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_TidkjXnW6H5Yn4',
    });
  } catch (err) {
    console.error('[Razorpay] Create order error:', err);
    res.status(500).json({ message: 'Failed to create Razorpay order', error: err.message });
  }
});

// @desc    Verify Razorpay payment signature
// @route   POST /api/payment/razorpay/verify
// @access  Private
router.post('/razorpay/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing payment verification parameters' });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const secret = process.env.RAZORPAY_KEY_SECRET || 'D8ozNijp8ANk3g5FTA4FT8Xx';
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      res.json({
        success: true,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
      });
    } else {
      res.status(400).json({ success: false, message: 'Payment signature verification failed' });
    }
  } catch (err) {
    console.error('[Razorpay] Verify error:', err);
    res.status(500).json({ message: 'Payment verification failed', error: err.message });
  }
});

export default router;
