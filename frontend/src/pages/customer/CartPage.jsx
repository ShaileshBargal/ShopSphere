import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Store,
  Truck,
  LogIn,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

const CartPage = () => {
  const { user } = useAuth();
  const {
    cartItems,
    itemsCount,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    updateQty,
    removeFromCart,
    clearCart,
  } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag size={36} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900">Sign In to View Your Cart</h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            Please log in to manage your cart, add items, and complete orders.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/login"
            state={{ from: '/cart' }}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-6 py-3.5 rounded-2xl shadow-lg shadow-teal-600/20 transition-all"
          >
            <LogIn size={15} />
            <span>Sign In to Your Account</span>
          </Link>
          <Link
            to="/products"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-6 py-3.5 rounded-2xl transition-all"
          >
            <span>Browse Products</span>
          </Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag size={36} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900">Your Cart is Empty</h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            Looks like you haven't added any items to your cart yet. Explore our curated multi-vendor collections!
          </p>
        </div>
        <div>
          <Link
            to="/products"
            className="inline-flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-6 py-3.5 rounded-2xl shadow-lg shadow-teal-600/20 transition-all"
          >
            <span>Start Shopping</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  const freeShippingThreshold = 150;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - itemsPrice);
  const freeShippingProgress = Math.min(100, (itemsPrice / freeShippingThreshold) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Shopping Cart ({itemsCount} {itemsCount === 1 ? 'item' : 'items'})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review items from multiple independent vendors
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline transition-colors"
        >
          Clear Cart
        </button>
      </div>

      {/* Free Shipping Progress Indicator */}
      <div className="bg-white rounded-2xl border border-teal-200/80 p-4 shadow-sm space-y-2">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800">
          <Truck size={16} className="text-teal-600 flex-shrink-0" />
          {amountNeededForFreeShipping === 0 ? (
            <span className="text-teal-700 font-bold">
              🎉 Congratulations! You have unlocked Free Express Shipping!
            </span>
          ) : (
            <span>
              Add <strong className="text-teal-700">₹{amountNeededForFreeShipping.toFixed(2)}</strong> more to unlock <strong className="text-teal-700">Free Shipping</strong>!
            </span>
          )}
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-500 transition-all duration-500 rounded-full"
            style={{ width: `${freeShippingProgress}%` }}
          />
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart items list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm divide-y divide-slate-100">
            {cartItems.map((item) => (
              <div
                key={item.product}
                className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:bg-slate-50/50 transition-colors"
              >
                {/* Image */}
                <Link
                  to={`/product/${item.product}`}
                  className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-1.5 text-[11px] text-teal-700 font-semibold">
                    <Store size={12} className="text-teal-600" />
                    <span>Sold by: {item.vendor || 'Verified Seller'}</span>
                  </div>
                  <Link
                    to={`/product/${item.product}`}
                    className="font-bold text-sm text-slate-900 hover:text-teal-600 transition-colors block line-clamp-1"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs text-slate-500">
                    Unit Price: ₹{Number(item.price).toFixed(2)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center space-x-3 self-end sm:self-center">
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                    <button
                      onClick={() => updateQty(item.product, item.qty - 1)}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-bold text-slate-800">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.product, item.qty + 1)}
                      disabled={item.qty >= item.countInStock}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>

                  <span className="font-bold text-sm text-slate-900 min-w-[70px] text-right">
                    ₹{(item.price * item.qty).toFixed(2)}
                  </span>

                  <button
                    onClick={() => removeFromCart(item.product)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Link
            to="/products"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors"
          >
            <ArrowRight size={14} className="rotate-180" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6 sticky top-24">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Order Summary
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Items Subtotal ({itemsCount})</span>
              <span className="font-semibold text-slate-900">₹{itemsPrice.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Estimated Shipping</span>
              <span className="font-semibold text-slate-900">
                {shippingPrice === 0 ? (
                  <span className="text-emerald-600 font-bold">FREE</span>
                ) : (
                  `₹${shippingPrice.toFixed(2)}`
                )}
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Estimated Tax (8%)</span>
              <span className="font-semibold text-slate-900">₹{taxPrice.toFixed(2)}</span>
            </div>

            <div className="border-t border-slate-100 pt-3 flex justify-between text-sm font-black text-slate-950">
              <span>Total Price</span>
              <span className="text-teal-700">₹{totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-teal-600/20 text-xs flex items-center justify-center space-x-2 transition-all hover:scale-[1.02]"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight size={16} />
          </button>

          <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-400">
            <ShieldCheck size={14} className="text-teal-600" />
            <span>Secure 256-Bit SSL Encrypted Checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
