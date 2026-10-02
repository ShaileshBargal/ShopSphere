import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Store,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminSidebar = () => {
  const { logout, user } = useAuth();

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/products', label: 'Products', icon: Package },
    { to: '/admin/categories', label: 'Categories', icon: Layers },
    { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { to: '/admin/users', label: 'Users', icon: Users },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col border-r border-slate-800 p-4">
      {/* Brand */}
      <div className="flex items-center space-x-3 px-2 py-4 mb-4 border-b border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg">
          SS
        </div>
        <div>
          <h2 className="font-extrabold text-white text-base tracking-tight">Admin Portal</h2>
          <p className="text-[11px] text-teal-400 font-medium">ShopSphere Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer info & Storefront link */}
      <div className="pt-4 border-t border-slate-800 space-y-2">
        <Link
          to="/"
          className="flex items-center space-x-3 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Store size={16} className="text-teal-400" />
          <span>Switch to Customer Store</span>
        </Link>

        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors text-left"
        >
          <LogOut size={16} />
          <span>Sign Out ({user?.name?.split(' ')[0]})</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
