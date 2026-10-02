import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import {
  Package,
  Truck,
  CreditCard,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Store,
  Copy,
  Check,
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import StatusBadge from '../../components/common/StatusBadge';
import OrderTimeline from '../../components/customer/OrderTimeline';
import { useToast } from '../../context/ToastContext';

const OrderDetailPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const justPlaced = searchParams.get('placed') === 'true';

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paying, setPaying] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await axiosInstance.get(`/orders/${id}`);
        setOrder(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not find order');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(id).then(() => {
      setCopied(true);
      showToast('Order ID copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSimulatePayment = async () => {
    setPaying(true);
    try {
      const { data } = await axiosInstance.put(`/orders/${id}/pay`, {
        id: `TXN-${Date.now()}`,
        status: 'COMPLETED',
      });
      setOrder(data);
      showToast('Payment marked as successful!', 'success');
    } catch (err) {
      showToast('Payment processing failed. Please try again.', 'error');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">{error || 'Order not found'}</h2>
        <Link to="/profile" className="text-xs font-semibold text-teal-600 hover:underline">
          Return to My Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Placed celebration banner if just completed checkout */}
      {justPlaced && (
        <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center space-x-4 text-emerald-900 shadow-sm animate-in fade-in slide-in-from-top-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={26} />
          </div>
          <div>
            <h3 className="font-extrabold text-base">Order Successfully Placed!</h3>
            <p className="text-xs text-emerald-700">
              Thank you for shopping on ShopSphere. The merchant sellers have received your order.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <Link to="/profile#orders" className="hover:text-teal-600 flex items-center space-x-1">
              <ArrowLeft size={12} />
              <span>Back to Orders</span>
            </Link>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-3">
            <span>Order #{order._id.slice(-8).toUpperCase()}</span>
            <StatusBadge status={order.orderStatus} />
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block">Total Amount</span>
          <span className="text-2xl font-black text-slate-900">
            ₹{Number(order.totalPrice).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Visual Timeline Tracking */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Delivery Status Progress
        </h3>
        <OrderTimeline status={order.orderStatus} />
      </div>

      {/* Shipping & Payment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping Address Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
            <MapPin size={18} className="text-teal-600" />
            <span>Shipping Information</span>
          </div>
          <div className="text-xs text-slate-600 space-y-1">
            <p className="font-bold text-slate-900">{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.address}</p>
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.postalCode}
            </p>
            <p>{order.shippingAddress.country}</p>
            <p className="text-slate-500 pt-1">Phone: {order.shippingAddress.phone}</p>
          </div>
        </div>

        {/* Payment Details Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
            <CreditCard size={18} className="text-teal-600" />
            <span>Payment Summary</span>
          </div>
          <div className="text-xs text-slate-600 space-y-2">
            <p>
              <strong className="text-slate-900">Method:</strong> {order.paymentMethod}
            </p>
            <div>
              {order.isPaid ? (
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 font-semibold inline-flex items-center space-x-2">
                  <CheckCircle2 size={15} />
                  <span>
                    Paid on {new Date(order.paidAt).toLocaleDateString()}
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-amber-50 text-amber-800 font-semibold inline-flex items-center space-x-2">
                    <Clock size={15} />
                    <span>Payment Pending ({order.paymentMethod})</span>
                  </div>
                  {order.paymentMethod !== 'Cash on Delivery' && (
                    <button
                      onClick={handleSimulatePayment}
                      disabled={paying}
                      className="block text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white px-3.5 py-2 rounded-xl shadow transition-colors"
                    >
                      {paying ? 'Processing Payment...' : 'Pay Online Now'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          Ordered Items ({order.orderItems?.length})
        </h3>

        <div className="divide-y divide-slate-100">
          {order.orderItems?.map((item, idx) => (
            <div key={idx} className="py-4 flex items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <Link
                    to={`/product/${item.product?._id || item.product}`}
                    className="font-bold text-xs sm:text-sm text-slate-900 hover:text-teal-600 transition-colors line-clamp-1"
                  >
                    {item.name}
                  </Link>
                  <div className="flex items-center space-x-1.5 text-[11px] text-teal-700 font-medium mt-0.5">
                    <Store size={12} />
                    <span>Sold by: {item.vendor || 'Verified Merchant'}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    ₹{Number(item.price).toFixed(2)} × {item.qty}
                  </span>
                </div>
              </div>

              <span className="font-extrabold text-sm text-slate-900">
                ₹{(item.price * item.qty).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* Pricing breakdown */}
        <div className="border-t border-slate-100 pt-4 space-y-1.5 text-xs max-w-xs ml-auto">
          <div className="flex justify-between text-slate-600">
            <span>Items Subtotal</span>
            <span className="font-semibold text-slate-900">₹{order.itemsPrice?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Shipping</span>
            <span className="font-semibold text-slate-900">
              {order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice?.toFixed(2)}`}
            </span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Estimated Tax</span>
            <span className="font-semibold text-slate-900">₹{order.taxPrice?.toFixed(2)}</span>
          </div>
          <div className="border-t border-slate-100 pt-2 flex justify-between text-sm font-black text-slate-950">
            <span>Total Paid</span>
            <span className="text-teal-700">₹{order.totalPrice?.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
