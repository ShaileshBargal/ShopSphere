import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CreditCard,
  Banknote,
  Wallet,
  Truck,
  CheckCircle2,
  Lock,
  Zap,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import axiosInstance from '../../api/axiosInstance';
import RazorpayModal from '../../components/customer/RazorpayModal';

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TidkjXnW6H5Yn4';

// Dynamically load Razorpay checkout script
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (document.getElementById('razorpay-sdk')) return resolve(true);
    const script = document.createElement('script');
    script.id = 'razorpay-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const CheckoutPage = () => {
  const {
    cartItems,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    shippingAddress,
    paymentMethod,
    saveShippingAddress,
    savePaymentMethod,
    clearCart,
  } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(shippingAddress.fullName || user?.name || '');
  const [address, setAddress] = useState(shippingAddress.address || user?.address?.street || '');
  const [city, setCity] = useState(shippingAddress.city || user?.address?.city || '');
  const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || user?.address?.zipCode || '');
  const [country, setCountry] = useState(shippingAddress.country || user?.address?.country || 'India');
  const [phone, setPhone] = useState(shippingAddress.phone || user?.phone || '');
  const [selectedPayment, setSelectedPayment] = useState(() => {
    const saved = paymentMethod || localStorage.getItem('shopsphere_payment_method');
    if (saved === 'Cash on Delivery') return 'Cash on Delivery';
    return 'Razorpay';
  });
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (cartItems.length === 0) navigate('/cart');
  }, [cartItems, navigate]);

  const createBackendOrder = async (addressData) => {
    const orderPayload = {
      orderItems: cartItems.map((item) => ({
        product: item.product,
        name: item.name,
        qty: item.qty,
        image: item.image,
        price: item.price,
        vendor: item.vendor,
      })),
      shippingAddress: addressData,
      paymentMethod: selectedPayment,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    };
    const { data } = await axiosInstance.post('/orders', orderPayload);
    return data;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!fullName || !address || !city || !postalCode || !phone) {
      setErrorMsg('Please complete all required shipping address fields');
      return;
    }

    setErrorMsg(null);
    const addressData = { fullName, address, city, postalCode, country, phone };
    saveShippingAddress(addressData);
    savePaymentMethod(selectedPayment);

    // If Razorpay, open the scanner-free Razorpay checkout modal
    if (selectedPayment === 'Razorpay') {
      setShowRazorpayModal(true);
      return;
    }

    // Cash on Delivery
    setIsSubmitting(true);
    try {
      const createdOrder = await createBackendOrder(addressData);
      clearCart();
      showToast('🎉 Order placed successfully (Cash on Delivery)!', 'success');
      navigate(`/order/${createdOrder._id}?placed=true`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to place order. Please try again.';
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRazorpaySuccess = async (paymentDetails) => {
    setShowRazorpayModal(false);
    setIsSubmitting(true);
    try {
      const addressData = { fullName, address, city, postalCode, country, phone };
      const createdOrder = await createBackendOrder(addressData);

      // Auto-approve and mark order as PAID in backend
      await axiosInstance.put(`/orders/${createdOrder._id}/pay`, {
        id: paymentDetails.razorpay_payment_id || `pay_${Date.now()}`,
        status: 'COMPLETED',
        update_time: new Date().toISOString(),
      });

      clearCart();
      showToast(`🎉 Payment approved via ${paymentDetails.method || 'Razorpay UPI'}! Order confirmed.`, 'success');
      navigate(`/order/${createdOrder._id}?placed=true`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to finalize order. Please try again.';
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRazorpayPayment = async (addressData) => {
    const sdkLoaded = await loadRazorpayScript();
    if (!sdkLoaded) {
      throw new Error('Razorpay SDK failed to load. Check your internet connection.');
    }

    // Create Razorpay order on backend
    const { data: rpOrder } = await axiosInstance.post('/payment/razorpay/create-order', {
      amount: totalPrice, // backend converts to paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    });

    // Create backend app order (will be updated to paid after verification)
    const appOrder = await createBackendOrder(addressData);

    return new Promise((resolve, reject) => {
      const options = {
        key: rpOrder.keyId || RAZORPAY_KEY,
        amount: rpOrder.amount,
        currency: rpOrder.currency,
        name: 'ShopSphere',
        description: `Order #${appOrder._id}`,
        order_id: rpOrder.orderId,
        prefill: {
          name: user?.name || fullName,
          email: user?.email || '',
          contact: phone,
        },
        theme: { color: '#0d9488' },
        handler: async (response) => {
          try {
            // Verify payment on backend
            await axiosInstance.post('/payment/razorpay/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            // Mark app order as paid
            await axiosInstance.put(`/orders/${appOrder._id}/pay`, {
              id: response.razorpay_payment_id,
              status: 'COMPLETED',
              update_time: new Date().toISOString(),
            });

            clearCart();
            showToast('🎉 Payment successful! Order confirmed.', 'success');
            navigate(`/order/${appOrder._id}?placed=true`);
            resolve();
          } catch (err) {
            reject(err);
          }
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
            showToast('Payment was cancelled.', 'info');
            reject(new Error('Payment dismissed'));
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  };

  const paymentOptions = [
    {
      value: 'Razorpay',
      icon: Zap,
      label: 'Pay with Razorpay (UPI, Google Pay, PhonePe, Cards)',
      sub: '⚡ Instant UPI auto-pay — No QR scan, no card numbers, no OTP needed',
      badge: 'Recommended',
      highlight: true,
    },
    {
      value: 'Cash on Delivery',
      icon: Banknote,
      label: 'Cash on Delivery (COD)',
      sub: 'Pay cash directly when courier arrives',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Checkout</h1>
        <p className="text-xs text-slate-500 mt-1">Complete your multi-vendor order securely</p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Shipping Address */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm pb-3 border-b border-slate-100">
              <Truck size={18} className="text-teal-600" />
              <span>1. Shipping Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Full Recipient Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street name, house number, apartment or suite"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Postal / Zip Code *</label>
                <input
                  type="text"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="Zip Code"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Country"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Mobile for delivery courier updates"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* 2. Payment Method */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm pb-3 border-b border-slate-100">
              <Lock size={18} className="text-teal-600" />
              <span>2. Payment Method</span>
            </div>

            <div className="space-y-3 text-xs">
              {paymentOptions.map(({ value, icon: Icon, label, sub, highlight, badge }) => {
                const isSelected = selectedPayment === value;
                return (
                  <label
                    key={value}
                    className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? highlight
                          ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20'
                          : 'border-slate-800 bg-slate-50 ring-2 ring-slate-800/10'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={value}
                        checked={isSelected}
                        onChange={(e) => setSelectedPayment(e.target.value)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex items-center space-x-2">
                        <Icon size={18} className={highlight ? 'text-blue-600' : 'text-slate-600'} />
                        <div>
                          <span className={`font-bold block ${highlight ? 'text-blue-950' : 'text-slate-900'}`}>
                            {label}
                          </span>
                          <span className="text-[11px] text-slate-500">{sub}</span>
                        </div>
                      </div>
                    </div>
                    {badge && (
                      <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full ml-2">
                        {badge}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>

            {selectedPayment === 'Razorpay' && (
              <div className="mt-3 p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 space-y-1.5 shadow-sm">
                <div className="flex items-center space-x-2">
                  <Zap size={16} className="text-blue-600 fill-blue-600" />
                  <span className="font-extrabold text-sm">⚡ Razorpay UPI Auto-Pay Active</span>
                </div>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Clicking <strong>Pay via Razorpay</strong> opens the checkout window. Click any UPI option (Google Pay, PhonePe, Paytm) to auto-approve payment instantly — <strong>no scanner required</strong>!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Review */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6 sticky top-24">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Review & Place Order
          </h3>

          {/* Mini item list */}
          <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 pr-1">
            {cartItems.map((item) => (
              <div key={item.product} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2.5">
                  <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover border" />
                  <div>
                    <span className="font-semibold text-slate-900 line-clamp-1 max-w-[140px]">{item.name}</span>
                    <span className="text-[10px] text-slate-400">Qty: {item.qty} × ₹{item.price.toFixed(2)}</span>
                  </div>
                </div>
                <span className="font-bold text-slate-900">₹{(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Price Breakdown */}
          <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
            <div className="flex justify-between text-slate-600">
              <span>Items Subtotal</span>
              <span className="font-semibold text-slate-900">₹{itemsPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping</span>
              <span className="font-semibold text-slate-900">
                {shippingPrice === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${shippingPrice.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Estimated Tax (8%)</span>
              <span className="font-semibold text-slate-900">₹{taxPrice.toFixed(2)}</span>
            </div>
            <div className="border-t border-slate-100 pt-2 flex justify-between text-base font-black text-slate-950">
              <span>Grand Total</span>
              <span className="text-teal-700">₹{totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full font-bold py-3.5 px-4 rounded-2xl text-xs flex items-center justify-center space-x-2 transition-all disabled:opacity-60 ${
              selectedPayment === 'Razorpay'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/25 hover:scale-[1.01]'
                : 'bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20'
            }`}
          >
            {isSubmitting ? (
              <span>Processing...</span>
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>
                  {selectedPayment === 'Razorpay'
                    ? `Pay ₹${totalPrice.toFixed(2)} via Razorpay`
                    : `Confirm Cash on Delivery Order (₹${totalPrice.toFixed(2)})`}
                </span>
              </>
            )}
          </button>

          <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-400">
            <ShieldCheck size={14} className="text-teal-600" />
            <span>Buyer Protection Guarantee</span>
          </div>
        </div>
      </form>

      {/* Razorpay Modal with Scanner-Bypassed UPI Auto-Pay */}
      <RazorpayModal
        isOpen={showRazorpayModal}
        onClose={() => setShowRazorpayModal(false)}
        amount={totalPrice}
        onSuccess={handleRazorpaySuccess}
        customerName={fullName || user?.name}
        customerPhone={phone}
      />
    </div>
  );
};

export default CheckoutPage;
