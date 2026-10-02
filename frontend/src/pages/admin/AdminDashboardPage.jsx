import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
} from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminStatCard from '../../components/admin/AdminStatCard';
import StatusBadge from '../../components/common/StatusBadge';
import axiosInstance from '../../api/axiosInstance';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const { data } = await axiosInstance.get('/dashboard/stats');
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await axiosInstance.put(`/orders/${orderId}/status`, { status: newStatus });
      fetchStats();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 space-y-8 overflow-y-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Overview</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live metrics, recent orders, and multi-vendor performance
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              to="/admin/products"
              className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-teal-600/20 transition-colors"
            >
              + Add Product
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
          </div>
        ) : (
          <>
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <AdminStatCard
                title="Total Revenue"
                value={`₹${Number(stats?.metrics?.totalRevenue || 0).toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
                icon={DollarSign}
                color="teal"
                subtitle="From non-cancelled orders"
              />
              <AdminStatCard
                title="Total Orders"
                value={stats?.metrics?.totalOrders || 0}
                icon={ShoppingBag}
                color="blue"
                subtitle="All time platform orders"
              />
              <AdminStatCard
                title="Active Products"
                value={stats?.metrics?.totalProducts || 0}
                icon={Package}
                color="purple"
                subtitle={`Across ${stats?.metrics?.totalCategories || 0} categories`}
              />
              <AdminStatCard
                title="Registered Users"
                value={stats?.metrics?.totalUsers || 0}
                icon={Users}
                color="amber"
                subtitle={`${stats?.metrics?.totalCustomers || 0} active customers`}
              />
            </div>

            {/* Order Status Breakdown Pill Grid */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Order Pipeline Status
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                  <span className="font-bold text-amber-800 block text-lg">
                    {stats?.orderStatusMap?.Pending || 0}
                  </span>
                  <span className="text-amber-700 font-semibold">Pending</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200">
                  <span className="font-bold text-sky-800 block text-lg">
                    {stats?.orderStatusMap?.Processing || 0}
                  </span>
                  <span className="text-sky-700 font-semibold">Processing</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200">
                  <span className="font-bold text-indigo-800 block text-lg">
                    {stats?.orderStatusMap?.Shipped || 0}
                  </span>
                  <span className="text-indigo-700 font-semibold">Shipped</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <span className="font-bold text-emerald-800 block text-lg">
                    {stats?.orderStatusMap?.Delivered || 0}
                  </span>
                  <span className="text-emerald-700 font-semibold">Delivered</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200">
                  <span className="font-bold text-rose-800 block text-lg">
                    {stats?.orderStatusMap?.Cancelled || 0}
                  </span>
                  <span className="text-rose-700 font-semibold">Cancelled</span>
                </div>
              </div>
            </div>

            {/* 2 Columns: Recent Orders & Low Stock Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Orders (2 cols) */}
              <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                    <Clock size={16} className="text-teal-600" />
                    <span>Recent Customer Orders</span>
                  </h3>
                  <Link
                    to="/admin/orders"
                    className="text-xs font-bold text-teal-600 hover:underline"
                  >
                    View All Orders
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-slate-400 uppercase font-semibold">
                      <tr>
                        <th className="pb-3">Order</th>
                        <th className="pb-3">Customer</th>
                        <th className="pb-3">Total</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Quick Update</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {stats?.recentOrders?.map((order) => (
                        <tr key={order._id} className="hover:bg-slate-50/60">
                          <td className="py-3 font-bold text-slate-800">
                            #{order._id.slice(-6).toUpperCase()}
                          </td>
                          <td className="py-3 text-slate-600 truncate max-w-[120px]">
                            {order.user?.name || 'Customer'}
                          </td>
                          <td className="py-3 font-bold text-slate-900">
                            ₹{Number(order.totalPrice).toFixed(2)}
                          </td>
                          <td className="py-3">
                            <StatusBadge status={order.orderStatus} />
                          </td>
                          <td className="py-3 text-right">
                            <select
                              value={order.orderStatus}
                              onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                              className="bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Low Stock Alerts (1 col) */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 text-slate-900 font-bold text-sm">
                  <AlertTriangle size={16} className="text-amber-500" />
                  <span>Low Stock Notice</span>
                </div>

                {stats?.lowStockProducts?.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">
                    All inventory levels are healthy!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {stats?.lowStockProducts?.map((item) => (
                      <div
                        key={item._id}
                        className="p-3 rounded-2xl bg-amber-50/60 border border-amber-100 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center space-x-2.5">
                          <img
                            src={item.images?.[0]}
                            alt={item.name}
                            className="w-9 h-9 rounded-lg object-cover border"
                          />
                          <div>
                            <span className="font-bold text-slate-900 line-clamp-1 max-w-[130px]">
                              {item.name}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {item.vendor?.storeName}
                            </span>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-amber-200 text-amber-900 font-bold rounded-md text-[10px]">
                          {item.countInStock} Left
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <Link
                  to="/admin/products"
                  className="block text-center text-xs font-bold text-teal-600 hover:underline pt-2"
                >
                  Manage All Inventory
                </Link>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboardPage;
