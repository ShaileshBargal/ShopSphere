import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
    phone: {
      type: String,
      default: '',
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zipCode: { type: String, default: '' },
      country: { type: String, default: '' },
    },
    avatar: {
      type: String,
      default: '',
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpire: {
      type: Date,
    },
    resetPasswordOtp: {
      type: String,
    },
    resetPasswordOtpExpire: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password in DB
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash 6-digit password reset OTP
userSchema.methods.getResetPasswordOtp = function () {
  // Generate random 6-digit numeric OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash OTP and store in DB
  this.resetPasswordOtp = crypto
    .createHash('sha256')
    .update(otp)
    .digest('hex');

  // Set expiration to 10 minutes from now
  this.resetPasswordOtpExpire = Date.now() + 10 * 60 * 1000;

  return otp;
};

// Generate and hash password reset token
userSchema.methods.getResetPasswordToken = function () {
  // Generate random token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire time to 10 minutes
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Instance method alias for forgotPassword
userSchema.methods.forgotPassword = function () {
  return this.getResetPasswordToken();
};

// Instance method to reset password
userSchema.methods.resetPassword = async function (newPassword) {
  this.password = newPassword;
  this.resetPasswordToken = undefined;
  this.resetPasswordExpire = undefined;
  this.resetPasswordOtp = undefined;
  this.resetPasswordOtpExpire = undefined;
  return await this.save();
};

// Static method for forgotPassword
userSchema.statics.forgotPassword = async function (email) {
  const user = await this.findOne({ email });
  if (!user) return null;
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  return { user, resetToken };
};

// Static method for resetPassword
userSchema.statics.resetPassword = async function (token, newPassword) {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await this.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) return null;

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.resetPasswordOtp = undefined;
  user.resetPasswordOtpExpire = undefined;
  await user.save();
  return user;
};

const User = mongoose.model('User', userSchema);
export default User;
