import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  ShoppingBag,
  TrendingUp,
  ShieldCheck,
  Store,
  Clock,
  Star,
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import ProductCard from '../../components/customer/ProductCard';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          axiosInstance.get('/products/top/featured'),
          axiosInstance.get('/categories'),
        ]);
        setFeaturedProducts(productsRes.data);
        setCategories(categoriesRes.data);
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();

    // Load recently viewed products
    const loadRecentlyViewed = async () => {
      try {
        const ids = JSON.parse(localStorage.getItem('shopsphere_recently_viewed') || '[]');
        if (ids.length === 0) return;
        const results = await Promise.allSettled(
          ids.slice(0, 4).map((pid) => axiosInstance.get(`/products/${pid}`))
        );
        const products = results
          .filter((r) => r.status === 'fulfilled')
          .map((r) => r.value.data);
        setRecentlyViewed(products);
      } catch (err) {
        console.error('Error loading recently viewed:', err);
      }
    };
    loadRecentlyViewed();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 text-white py-20 lg:py-28 px-4 sm:px-6 lg:px-8 rounded-3xl mx-4 sm:mx-8 mt-4 shadow-2xl">
        {/* Dot grid background */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:20px_20px]" />
        {/* Glow orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold">
            <Sparkles size={14} className="text-teal-400" />
            <span>Discover Top Independent Sellers & Brands</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            Curated Multi-Vendor Shopping,{' '}
            <span className="bg-gradient-to-r from-teal-400 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
              Reimagined.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed">
            Shop premium electronics, boutique fashion, artisan home living, and luxury timepieces
            from verified independent merchants worldwide.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-7 py-3.5 rounded-2xl shadow-lg shadow-teal-500/25 hover:scale-105 transition-all text-sm"
            >
              <span>Explore All Products</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/products?sort=popular"
              className="inline-flex items-center space-x-2 bg-slate-800/80 hover:bg-slate-700 text-white font-semibold px-6 py-3.5 rounded-2xl border border-slate-700 transition-all text-sm"
            >
              <TrendingUp size={16} className="text-teal-400" />
              <span>Trending Best Sellers</span>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
            {[
              { icon: ShieldCheck, label: 'Buyer Protection' },
              { icon: Store, label: 'Verified Vendors' },
              { icon: TrendingUp, label: 'Best Prices' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center space-x-1.5 text-teal-300 text-[11px] font-semibold">
                <Icon size={14} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Featured Categories</h2>
            <p className="text-xs text-slate-500 mt-1">Browse collections by department</p>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center space-x-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/products?category=${cat.slug || cat._id}`}
              className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-900 flex flex-col justify-end p-4 border border-slate-200/50 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover opacity-65 group-hover:scale-110 group-hover:opacity-80 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
              <div className="relative z-10">
                <h3 className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-slate-300">
                  {cat.productCount ? `${cat.productCount} Products` : 'Shop Collection'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-teal-600 mb-1">
              <Sparkles size={14} />
              <span>Staff Picks & Popular Drops</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Trending Products</h2>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center space-x-1 transition-colors"
          >
            <span>See Catalog</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-64 sm:h-72 skeleton rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Recently Viewed Section */}
      {recentlyViewed.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Clock size={18} className="text-slate-500" />
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Recently Viewed</h2>
            </div>
            <Link
              to="/products"
              className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center space-x-1 transition-colors"
            >
              <span>Browse More</span>
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {recentlyViewed.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Multi-Vendor Showcase Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#5eead4_1px,transparent_1px)] [background-size:24px_24px]" />
          <div className="absolute right-0 top-0 w-72 h-72 bg-teal-400/10 rounded-full blur-3xl" />

          <div className="max-w-xl space-y-4 relative z-10">
            <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-teal-200 border border-white/10">
              Verified Multi-Vendor Network
            </span>
            <h2 className="text-2xl sm:text-3xl font-black leading-tight">
              Buy directly from top-tier brands and local craft vendors.
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Every seller on ShopSphere passes strict authenticity checks and quality benchmarks.
              Enjoy direct merchant pricing with unified single-cart checkout and buyer protection.
            </p>
            <div className="pt-2">
              <Link
                to="/products"
                className="inline-flex items-center space-x-2 bg-white text-slate-900 hover:bg-teal-50 font-bold px-6 py-3 rounded-xl shadow text-xs transition-colors"
              >
                <span>Browse Verified Stores</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
