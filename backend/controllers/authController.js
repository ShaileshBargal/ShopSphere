import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendOtpEmail } from '../utils/sendEmail.js';

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'shopsphere_jwt_secret', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Register a new customer
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password, phone, address } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists with this email' });
  }

  const user = await User.create({
    name,
    email,
    password,
    phone: phone || '',
    address: address || {},
    role: 'customer',
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data provided' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      avatar: user.avatar,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;

    if (req.body.address) {
      user.address = {
        ...user.address,
        ...req.body.address,
      };
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      address: updatedUser.address,
      avatar: updatedUser.avatar,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Send 6-digit OTP for Password Reset using Google App Password
// @route   POST /api/auth/forgotpassword & POST /api/auth/send-otp
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide an email address' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({ message: 'No registered user found with that email address' });
    }

    // Generate 6-digit OTP
    const otp = user.getResetPasswordOtp();
    await user.save({ validateBeforeSave: false });

    // Send OTP via Google Gmail SMTP
    try {
      await sendOtpEmail(user.email, otp, user.name);
      console.log(`[ShopSphere] OTP email successfully delivered to ${user.email}`);

      return res.status(200).json({
        success: true,
        message: `A 6-digit verification code has been sent to ${user.email}. Please check your email inbox and spam folder.`,
        email: user.email,
        expiresInMinutes: 10,
      });
    } catch (err) {
      console.error(`[ShopSphere] Failed to send email via Google SMTP:`, err.message);
      return res.status(500).json({
        message: `Failed to send email to ${user.email}: ${err.message}. Please check your Google App Password configuration in backend/.env`,
      });
    }
  } catch (error) {
    console.error('Forgot password / OTP error:', error);
    res.status(500).json({ message: error.message || 'Server error sending password reset OTP' });
  }
};

// @desc    Verify OTP for Password Reset
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Please provide both email and OTP' });
    }

    const hashedOtp = crypto
      .createHash('sha256')
      .update(otp.toString().trim())
      .digest('hex');

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetPasswordOtp: hashedOtp,
      resetPasswordOtpExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP. Please request a new code.' });
    }

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully.',
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error verifying OTP' });
  }
};

// @desc    Reset password using OTP or Token
// @route   POST /api/auth/reset-password & PUT /api/auth/resetpassword/:token
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, password: newPasswordFromBody, newPassword } = req.body;
    const token = req.params.token || req.params.resettoken || req.body.token;
    const password = newPasswordFromBody || newPassword;

    if (!password) {
      return res.status(400).json({ message: 'Please provide a new password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    let user = null;

    // 1. If email + OTP provided (Google App Password OTP workflow)
    if (email && otp) {
      const hashedOtp = crypto
        .createHash('sha256')
        .update(otp.toString().trim())
        .digest('hex');

      user = await User.findOne({
        email: email.toLowerCase().trim(),
        resetPasswordOtp: hashedOtp,
        resetPasswordOtpExpire: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({
          message: 'Invalid or expired OTP. Please double-check the 6 digits or request a new code.',
        });
      }
    } 
    // 2. Or if URL reset token provided
    else if (token) {
      const resetPasswordToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({
          message: 'Invalid or expired password reset link/token.',
        });
      }
    } else {
      return res.status(400).json({
        message: 'Please provide email & OTP or a valid reset token.',
      });
    }

    // Set new password (pre-save hook will hash it)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful! You can now log in with your new password.',
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: error.message || 'Server error resetting password' });
  }
};
