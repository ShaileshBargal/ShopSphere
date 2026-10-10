import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Clock,
  Eye,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import StatusBadge from '../../components/common/StatusBadge';
import axiosInstance from '../../api/axiosInstance';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const url = statusFilter === 'all' ? '/orders' : `/orders?status=${statusFilter}`;
      const { data } = await axiosInstance.get(url);
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axiosInstance.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
      );
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  const handleTogglePaid = async (orderId, currentPaid) => {
    try {
      await axiosInstance.put(`/orders/${orderId}/status`, { isPaid: !currentPaid });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, isPaid: !currentPaid } : o))
      );
    } catch (err) {
      alert('Failed to update payment status');
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8 overflow-y-auto pt-16 lg:pt-8 w-full max-w-full min-w-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Orders Management</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Monitor customer purchases, fulfill orders, and update shipping progress
            </p>
          </div>

          {/* Status Filter Tab/Select */}
          <div className="flex items-center space-x-2 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm text-xs font-semibold">
            <Filter size={14} className="text-slate-400 ml-1" />
            <span className="text-slate-500">Filter:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Orders</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-20 flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No orders found with status "{statusFilter}".
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200/80">
                  <tr>
                    <th className="py-4 px-6">Order ID</th>
                    <th className="py-4 px-6">Customer</th>
                    <th className="py-4 px-6">Items</th>
                    <th className="py-4 px-6">Total Amount</th>
                    <th className="py-4 px-6">Payment</th>
                    <th className="py-4 px-6">Fulfillment Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-6 font-bold text-slate-900">
                        #{order._id.slice(-8).toUpperCase()}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="py-3.5 px-6">
                        <span className="font-bold text-slate-900 block">
                          {order.user?.name || order.shippingAddress?.fullName || 'Customer'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {order.user?.email || 'Guest'}
                        </span>
                      </td>

                      <td className="py-3.5 px-6 text-slate-600">
                        {order.orderItems?.length} items
                        <span className="block text-[10px] text-teal-700 font-medium truncate max-w-[140px]">
                          {order.orderItems?.[0]?.name}
                        </span>
                      </td>

                      <td className="py-3.5 px-6 font-extrabold text-slate-900">
                        ₹{Number(order.totalPrice).toFixed(2)}
                      </td>

                      <td className="py-3.5 px-6">
                        <button
                          onClick={() => handleTogglePaid(order._id, order.isPaid)}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold border transition-colors ${
                            order.isPaid
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                          }`}
                          title="Click to toggle paid status"
                        >
                          {order.isPaid ? 'Paid' : 'Unpaid (COD/Pending)'}
                        </button>
                      </td>

                      <td className="py-3.5 px-6">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-6 text-right">
                        <Link
                          to={`/order/${order._id}`}
                          className="inline-flex items-center space-x-1 text-teal-600 hover:text-teal-700 font-bold hover:underline"
                        >
                          <Eye size={14} />
                          <span>View Detail</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminOrdersPage;
