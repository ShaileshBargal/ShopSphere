import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// Password Reset with OTP & Google App Password SMTP
router.post('/send-otp', forgotPassword);
router.post('/verify-otp', verifyResetOtp);
router.post('/forgotpassword', forgotPassword);
router.post('/forgot-password', forgotPassword);

// Reset password with either email+OTP payload or URL token
router.post('/reset-password', resetPassword);
router.put('/reset-password', resetPassword);
router.route('/resetpassword/:token').put(resetPassword).post(resetPassword);
router.route('/reset-password/:token').put(resetPassword).post(resetPassword);

router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

export default router;
