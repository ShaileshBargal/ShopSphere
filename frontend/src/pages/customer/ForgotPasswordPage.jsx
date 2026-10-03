import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  KeyRound,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCw,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  // Step 1: Request OTP | Step 2: Enter OTP & Verify Password | Step 3: Success
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Countdown timer for OTP validity (10 mins = 600s)
  const [timeLeft, setTimeLeft] = useState(600);
  // Resend cooldown timer (30s)
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef([]);

  useEffect(() => {
    let timer;
    if (step === 2 && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  useEffect(() => {
    let cooldownTimer;
    if (resendCooldown > 0) {
      cooldownTimer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(cooldownTimer);
  }, [resendCooldown]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Dedicated paste handler
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newOtp = ['', '', '', '', '', ''];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    const nextEmptyIndex = newOtp.findIndex((d) => !d);
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }
  };

  // Handle single-digit input per box without overflowing or auto-duplicating
  const handleOtpChange = (index, value) => {
    const cleanDigits = value.replace(/\D/g, '');
    const char = cleanDigits.length > 0 ? cleanDigits.slice(-1) : '';

    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Step 1: Send OTP to email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { data } = await axiosInstance.post('/auth/send-otp', { email });
      setSuccessMessage(data.message || `OTP has been sent to ${email}`);
      setStep(2);
      setOtp(['', '', '', '', '', '']);
      setTimeLeft(600);
      setResendCooldown(30);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to send OTP email. Please check your email address.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resending) return;

    setResending(true);
    setError(null);

    try {
      const { data } = await axiosInstance.post('/auth/send-otp', { email });
      setSuccessMessage(data.message || `A fresh OTP has been sent to ${email}`);
      setOtp(['', '', '', '', '', '']);
      setTimeLeft(600);
      setResendCooldown(30);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  // Step 2: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);

    const fullOtp = otp.join('').trim();
    if (!fullOtp || fullOtp.length !== 6) {
      setError('Please enter the 6-digit OTP code');
      return;
    }

    if (password.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password and Verify Password do not match');
      return;
    }

    setLoading(true);

    try {
      await axiosInstance.post('/auth/reset-password', {
        email,
        otp: fullOtp,
        password,
      });

      setStep(3);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Invalid or expired OTP. Please check the code and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const hasMinLength = password.length >= 6;
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-600 to-teal-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-teal-600/25">
            {step === 3 ? <ShieldCheck size={26} /> : <KeyRound size={26} />}
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {step === 1 && 'Forgot Password'}
            {step === 2 && 'Reset Password'}
            {step === 3 && 'Password Changed!'}
          </h1>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-start space-x-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && step === 2 && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center space-x-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* STEP 1: Enter Email & Request OTP */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@gmail.com"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <Mail size={16} className="absolute left-3 top-2.5 text-slate-400" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 rounded-xl shadow-md shadow-teal-600/20 text-xs flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                <span>{loading ? 'Sending OTP...' : 'Send OTP'}</span>
                <ArrowRight size={14} />
              </button>
            </form>
          )}

          {/* STEP 2: Enter OTP + Verify Password */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              {/* 6-Digit OTP inputs */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-semibold text-slate-700">
                    6-Digit OTP
                  </label>
                  <span className="text-[11px] font-semibold text-slate-500 flex items-center space-x-1">
                    <Clock size={12} className="text-teal-600" />
                    <span>{formatTime(timeLeft)}</span>
                  </span>
                </div>

                <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck="false"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className={`w-11 h-12 text-center font-mono font-black text-lg rounded-xl border ${
                        digit
                          ? 'border-teal-500 bg-white text-slate-900'
                          : 'border-slate-200 bg-slate-50/50 text-slate-900'
                      } focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all shadow-inner`}
                    />
                  ))}
                </div>

                <div className="mt-1.5 text-right">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || resending}
                    className="inline-flex items-center space-x-1 text-[11px] font-semibold text-slate-600 hover:text-teal-600 disabled:text-slate-400 hover:underline"
                  >
                    <RotateCw size={11} className={resending ? 'animate-spin' : ''} />
                    <span>
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                    </span>
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">New Password</label>
                  {hasMinLength && (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center space-x-0.5">
                      <Check size={11} />
                      <span>Min 6 chars</span>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className={`w-full pl-9 pr-10 py-2.5 rounded-xl border ${
                      hasMinLength ? 'border-emerald-300' : 'border-slate-200'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  />
                  <Lock size={16} className="absolute left-3 top-2.5 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Verify Password (Confirm Password) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">
                    Verify Password
                  </label>
                  {passwordsMatch && (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center space-x-0.5">
                      <Check size={11} />
                      <span>Passwords match</span>
                    </span>
                  )}
                  {passwordsMismatch && (
                    <span className="text-[10px] font-bold text-rose-500 flex items-center space-x-0.5">
                      <X size={11} />
                      <span>Passwords do not match</span>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password to verify"
                    className={`w-full pl-9 pr-10 py-2.5 rounded-xl border ${
                      passwordsMatch
                        ? 'border-emerald-400 bg-emerald-50/20'
                        : passwordsMismatch
                        ? 'border-rose-300 bg-rose-50/20'
                        : 'border-slate-200'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  />
                  <Lock size={16} className="absolute left-3 top-2.5 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !hasMinLength || !passwordsMatch || otp.join('').length !== 6}
                className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 rounded-xl shadow-md shadow-teal-600/20 text-xs flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                <span>{loading ? 'Updating Password...' : 'Reset Password'}</span>
                <ArrowRight size={14} />
              </button>
            </form>
          )}

          {/* STEP 3: Success Screen */}
          {step === 3 && (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
              <CheckCircle2 size={36} className="text-emerald-600 mx-auto" />
              <h3 className="text-sm font-bold text-emerald-900">Password Reset Successful!</h3>
              <p className="text-xs text-emerald-700">
                Your password has been updated. Redirecting to sign in...
              </p>
              <Link
                to="/login"
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
              >
                <span>Sign In Now</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          )}

          {/* Footer Back Link */}
          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            Remember your password?{' '}
            <Link
              to="/login"
              className="font-bold text-teal-600 hover:underline inline-flex items-center space-x-1"
            >
              <ArrowLeft size={12} className="inline mr-0.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
