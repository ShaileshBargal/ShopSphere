import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const Footer = () => {
  const { showToast } = useToast();

  const handleNewsletter = (e) => {
    e.preventDefault();
    const emailInput = e.target.querySelector('input[type="email"]');
    if (emailInput?.value?.trim()) {
      showToast('🎉 You\'re subscribed! Exclusive deals on the way.', 'success');
      emailInput.value = '';
    } else {
      showToast('Please enter a valid email address.', 'warning');
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto border-t border-slate-800">
      {/* Value propositions banner */}
      <div className="border-b border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Truck, title: 'Free Fast Shipping', desc: 'On all orders over ₹150' },
            { icon: ShieldCheck, title: 'Verified Multi-Vendors', desc: '100% authentic curated sellers' },
            { icon: RotateCcw, title: '30-Day Easy Returns', desc: 'Hassle-free money-back guarantee' },
            { icon: Headphones, title: '24/7 Support', desc: 'Instant customer care anytime' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center space-x-3.5 group">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-500/20 transition-colors">
                <Icon size={20} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">{title}</h4>
                <p className="text-xs text-slate-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {/* Brand Column */}
        <div className="space-y-4 sm:col-span-2 md:col-span-1">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-400 flex items-center justify-center text-white shadow-md">
              <ShoppingBag size={18} />
            </div>
            <span className="font-extrabold text-xl text-white tracking-tight">ShopSphere</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The next-generation multi-vendor marketplace connecting customers with world-class
            independent designers, makers, and premier brands.
          </p>
          {/* Social Links */}
          <div className="flex items-center space-x-2 pt-1">
            {[
              { icon: Instagram, label: 'Instagram' },
              { icon: Twitter, label: 'Twitter' },
              { icon: Facebook, label: 'Facebook' },
              { icon: Youtube, label: 'YouTube' },
            ].map(({ icon: Icon, label }) => (
              <button
                key={label}
                title={label}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-teal-600 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-200"
              >
                <Icon size={15} />
              </button>
            ))}
          </div>
        </div>

        {/* Shop Categories */}
        <div>
          <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Shop</h5>
          <ul className="space-y-2 text-xs">
            {[
              { to: '/products?category=electronics', label: 'Electronics & Audio' },
              { to: '/products?category=fashion', label: 'Fashion & Apparel' },
              { to: '/products?category=home-kitchen', label: 'Home & Living' },
              { to: '/products?category=watches-jewelry', label: 'Watches & Jewelry' },
              { to: '/products?category=beauty-wellness', label: 'Beauty & Wellness' },
            ].map(({ to, label }) => (
              <li key={label}>
                <Link to={to} className="text-slate-400 hover:text-teal-400 transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Customer Service */}
        <div>
          <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Support</h5>
          <ul className="space-y-2 text-xs">
            <li><Link to="/profile" className="text-slate-400 hover:text-teal-400 transition-colors">My Account</Link></li>
            <li><Link to="/profile#orders" className="text-slate-400 hover:text-teal-400 transition-colors">Track My Orders</Link></li>
            <li><Link to="/wishlist" className="text-slate-400 hover:text-teal-400 transition-colors">My Wishlist</Link></li>
            <li><Link to="/cart" className="text-slate-400 hover:text-teal-400 transition-colors">Shopping Cart</Link></li>
            <li><span className="text-slate-400 hover:text-teal-400 transition-colors cursor-pointer">Shipping & Delivery Info</span></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Stay Updated</h5>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Subscribe for exclusive product drops and special discount codes.
          </p>
          <form onSubmit={handleNewsletter} className="space-y-2">
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full bg-slate-800 text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-teal-500 text-white placeholder-slate-500 transition-colors"
            />
            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold px-3 py-2.5 rounded-xl transition-colors"
            >
              Subscribe Now
            </button>
          </form>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} ShopSphere Inc. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Cookie Settings</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
