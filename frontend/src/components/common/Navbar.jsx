import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  Package,
  Menu,
  X,
  ChevronDown,
  Heart,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import axiosInstance from '../../api/axiosInstance';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { itemsCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axiosInstance.get('/categories');
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories in navbar:', err);
      }
    };
    fetchCategories();
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md shadow-md shadow-slate-200/60 border-b border-slate-200/60'
          : 'bg-white/95 backdrop-blur border-b border-slate-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2.5 flex-shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-teal-500/25 group-hover:scale-105 group-hover:shadow-teal-500/40 transition-all duration-200">
              <ShoppingBag size={22} className="stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 via-teal-900 to-teal-700 bg-clip-text text-transparent">
                ShopSphere
              </span>
              <span className="text-[10px] font-semibold tracking-widest uppercase text-teal-600 -mt-1">
                Multi-Vendor
              </span>
            </div>
          </Link>

          {/* Search Form (Desktop & Tablet) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-lg relative items-center"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, brands, or vendors..."
              className="w-full bg-slate-100 border border-slate-200 rounded-full py-2 pl-10 pr-20 text-sm focus:outline-none focus:bg-white transition-all text-slate-800 placeholder-slate-400"
            />
            <Search size={17} className="absolute left-3.5 text-slate-400" />
            <button
              type="submit"
              className="absolute right-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
            >
              Search
            </button>
          </form>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium text-slate-600">
            <Link
              to="/"
              className="relative hover:text-teal-600 transition-colors after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 hover:after:w-full after:bg-teal-500 after:transition-all after:duration-300"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="relative hover:text-teal-600 transition-colors after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 hover:after:w-full after:bg-teal-500 after:transition-all after:duration-300"
            >
              Explore Products
            </Link>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-1.5">
            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              className="relative p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
              title="Wishlist"
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[11px] font-bold h-5 w-5 rounded-full flex items-center justify-center ring-2 ring-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2 text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-full transition-colors"
              title="Shopping Cart"
            >
              <ShoppingBag size={22} />
              {itemsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-teal-600 text-white text-[11px] font-bold h-5 w-5 rounded-full flex items-center justify-center ring-2 ring-white badge-pulse">
                  {itemsCount}
                </span>
              )}
            </Link>

            {/* User Account / Auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-slate-100 transition-colors text-slate-700"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-semibold hidden md:block max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-slate-400 hidden md:block transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-[11px] text-slate-400 font-medium">Signed in as</p>
                      <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                      <span className="inline-block mt-0.5 px-2 py-0.5 bg-teal-50 text-teal-700 text-[10px] font-bold rounded-md uppercase tracking-wider">
                        {user.role}
                      </span>
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center space-x-2.5 px-4 py-2.5 text-sm text-teal-700 font-semibold hover:bg-teal-50 transition-colors"
                      >
                        <LayoutDashboard size={16} />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    <Link
                      to="/profile"
                      className="flex items-center space-x-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <UserIcon size={16} />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/profile#orders"
                      className="flex items-center space-x-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Package size={16} />
                      <span>My Orders</span>
                    </Link>

                    <Link
                      to="/wishlist"
                      className="flex items-center space-x-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Heart size={16} />
                      <span>My Wishlist {wishlistCount > 0 && `(${wishlistCount})`}</span>
                    </Link>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={logout}
                      className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-teal-600 px-3 py-1.5 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm hover:shadow transition-all"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-teal-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Search & Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-4 pt-2 border-t border-slate-100 space-y-3 animate-fade-in">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            </form>

            <div className="flex flex-col space-y-1 text-sm font-medium text-slate-700">
              <Link to="/" className="px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors">Home</Link>
              <Link to="/products" className="px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors">All Products</Link>
              <Link to="/wishlist" className="px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 transition-colors flex items-center space-x-2">
                <Heart size={15} />
                <span>Wishlist {wishlistCount > 0 && `(${wishlistCount})`}</span>
              </Link>
              {isAdmin && (
                <Link to="/admin" className="px-3 py-2 rounded-xl bg-teal-50 text-teal-700 font-semibold transition-colors">
                  Admin Dashboard
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
