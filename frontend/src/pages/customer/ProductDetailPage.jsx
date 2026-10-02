import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Store,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Star,
  ArrowLeft,
  Heart,
  Share2,
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import RatingStars from '../../components/common/RatingStars';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedNotice, setAddedNotice] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get(`/products/${id}`);
        setProduct(data);
        setSelectedImage(data.images?.[0] || '');

        // Track recently viewed (store product ID, max 6, no duplicates)
        const saved = JSON.parse(localStorage.getItem('shopsphere_recently_viewed') || '[]');
        const updated = [id, ...saved.filter((pid) => pid !== id)].slice(0, 6);
        localStorage.setItem('shopsphere_recently_viewed', JSON.stringify(updated));
      } catch (err) {
        setError('Product not found or unavailable');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">{error || 'Product not found'}</h2>
        <Link
          to="/products"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-teal-600 hover:text-teal-700"
        >
          <ArrowLeft size={16} />
          <span>Back to products</span>
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.countInStock <= 0;
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    navigate('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-teal-600">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-teal-600">Products</Link>
        <span>/</span>
        <span className="text-slate-800 font-medium truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main product showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* Left: Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm relative">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                {discount}% OFF
              </span>
            )}
          </div>

          {/* Thumbnail list */}
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    selectedImage === img
                      ? 'border-teal-600 ring-2 ring-teal-100 scale-105'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Actions */}
        <div className="space-y-6">
          {/* Vendor Card */}
          <div className="inline-flex items-center space-x-2.5 bg-teal-50/80 border border-teal-200/70 px-3.5 py-1.5 rounded-full text-xs text-teal-800 font-semibold">
            <Store size={14} className="text-teal-600" />
            <span>Sold by: {product.vendor?.storeName || 'Verified Merchant'}</span>
            <span className="w-1 h-1 rounded-full bg-teal-400" />
            <span className="text-amber-500 font-bold">★ {product.vendor?.rating || 4.9}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
            {product.name}
          </h1>

          <div className="flex items-center space-x-4">
            <RatingStars rating={product.rating} reviewsCount={product.numReviews} size={16} />
            <span className="text-xs text-slate-300">|</span>
            <span className="text-xs text-teal-600 font-semibold bg-teal-50 px-2.5 py-0.5 rounded-full">
              Category: {product.category?.name || 'General'}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline space-x-3">
            <span className="text-3xl font-black text-slate-950">
              ₹{Number(product.price).toFixed(2)}
            </span>
            {product.compareAtPrice > product.price && (
              <span className="text-base text-slate-400 line-through">
                ₹{Number(product.compareAtPrice).toFixed(2)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div>
            {isOutOfStock ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                Out of Stock
              </span>
            ) : product.countInStock <= 5 ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                Low Stock: Only {product.countInStock} remaining!
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                In Stock ({product.countInStock} available)
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {product.description}
          </p>

          {/* Quantity and Actions */}
          {!isOutOfStock && (
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Quantity:
                </span>
                <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white shadow-sm">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 text-sm font-bold transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-xs font-bold text-slate-800">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.countInStock, q + 1))}
                    className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 text-sm font-bold transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3.5 px-6 rounded-2xl text-xs font-bold shadow-md transition-all ${
                    addedNotice
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20'
                  }`}
                >
                  {addedNotice ? (
                    <>
                      <Check size={16} />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={16} />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  className="flex-1 bg-teal-600 hover:bg-teal-500 text-white py-3.5 px-6 rounded-2xl text-xs font-bold shadow-md shadow-teal-600/20 transition-all"
                >
                  Buy It Now
                </button>
              </div>
            </div>
          )}

          {/* Value props mini list */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center space-x-2">
              <Truck size={16} className="text-teal-600 flex-shrink-0" />
              <span>Fast Tracked Dispatch</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck size={16} className="text-teal-600 flex-shrink-0" />
              <span>Multi-Vendor Authentic</span>
            </div>
            <div className="flex items-center space-x-2">
              <RotateCcw size={16} className="text-teal-600 flex-shrink-0" />
              <span>30-Day Hassle-Free Returns</span>
            </div>
            <div className="flex items-center space-x-2">
              <Store size={16} className="text-teal-600 flex-shrink-0" />
              <span>Direct Merchant Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Details / Specs / Reviews */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex border-b border-slate-200 space-x-8 mb-6">
          <button
            onClick={() => setActiveTab('description')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === 'description'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Product Overview
          </button>
          <button
            onClick={() => setActiveTab('vendor')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === 'vendor'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Merchant Information
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === 'reviews'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Customer Reviews ({product.numReviews})
          </button>
        </div>

        {activeTab === 'description' && (
          <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed space-y-4">
            <p>{product.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div>
                <span className="font-bold text-slate-900">Brand:</span> {product.brand || 'ShopSphere Curated'}
              </div>
              <div>
                <span className="font-bold text-slate-900">Category:</span> {product.category?.name}
              </div>
              <div>
                <span className="font-bold text-slate-900">SKU / Slug:</span> {product.slug}
              </div>
              <div>
                <span className="font-bold text-slate-900">Stock Availability:</span> {product.countInStock} units
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vendor' && (
          <div className="space-y-4 text-xs text-slate-700">
            <div className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-base">
                <Store size={22} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{product.vendor?.storeName}</h4>
                <p className="text-slate-500">Managed by {product.vendor?.name}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-amber-500 font-bold">★ {product.vendor?.rating} Merchant Rating</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-emerald-700 font-semibold">Verified Partner</span>
                </div>
              </div>
            </div>
            <p className="leading-relaxed">
              This vendor is bound by the ShopSphere Buyer Protection policy. Products are inspected before shipment and shipped with verified tracking numbers.
            </p>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="text-center p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-3xl font-black text-slate-900">{product.rating}</span>
                <RatingStars rating={product.rating} showNumber={false} size={14} />
                <span className="text-[10px] text-slate-400 mt-1 block">Based on {product.numReviews} ratings</span>
              </div>
              <p className="text-xs text-slate-500">
                100% of verified buyers recommend this multi-vendor product.
              </p>
            </div>

            <div className="space-y-4 border-t border-slate-100 pt-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Michael R. (Verified Buyer)</span>
                  <RatingStars rating={5} showNumber={false} size={12} />
                </div>
                <p className="text-xs text-slate-600">
                  Exceptional quality and arrived faster than expected. The vendor packaged it with great care.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Sarah K. (Verified Buyer)</span>
                  <RatingStars rating={5} showNumber={false} size={12} />
                </div>
                <p className="text-xs text-slate-600">
                  Matches the description completely. Very happy with this purchase from {product.vendor?.storeName}!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
