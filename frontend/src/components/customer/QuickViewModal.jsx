import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { X, ShoppingCart, Heart, Star, Tag, ExternalLink, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';

const QuickViewModal = ({ product, onClose }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const wishlisted = isWishlisted(product._id);

  const discountPercent =
    product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleAddToCart = () => {
    if (!user) {
      showToast('Please sign in to add items to your cart', 'info');
      onClose();
      navigate('/login', { state: { from: location } });
      return;
    }

    if (product.countInStock === 0) return;
    const result = addToCart(product);
    if (result?.requireAuth) {
      showToast('Please sign in to add items to your cart', 'info');
      onClose();
      navigate('/login', { state: { from: location } });
      return;
    }
    showToast(`"${product.name}" added to cart!`, 'success');
    onClose();
  };

  const handleWishlist = () => {
    const added = toggleWishlist(product);
    showToast(added ? '❤️ Added to wishlist!' : 'Removed from wishlist', added ? 'success' : 'info');
  };

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

      {/* Modal Panel */}
      <div
        className="relative z-10 w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex flex-col sm:flex-row">
          {/* Product Image */}
          <div className="relative sm:w-2/5 bg-slate-100 aspect-square sm:aspect-auto">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {discountPercent && (
              <span className="absolute top-3 left-3 inline-flex items-center space-x-1 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                <Tag size={9} />
                <span>-{discountPercent}%</span>
              </span>
            )}
            {product.featured && (
              <span className="absolute top-3 right-10 inline-flex items-center space-x-1 bg-teal-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                <Zap size={9} />
                <span>Featured</span>
              </span>
            )}
          </div>

          {/* Product Info */}
          <div className="sm:w-3/5 p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              {product.vendor?.storeName && (
                <p className="text-[11px] font-bold uppercase tracking-wider text-teal-600">
                  {product.vendor.storeName}
                </p>
              )}

              <h2 className="text-lg font-black text-slate-900 leading-snug">
                {product.name}
              </h2>

              {/* Rating */}
              <div className="flex items-center space-x-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={13}
                      className={
                        star <= Math.round(product.rating)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-200 fill-slate-200'
                      }
                    />
                  ))}
                </div>
                <span className="text-xs text-slate-500">({product.numReviews} reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-slate-900">
                  ₹{product.price.toFixed(2)}
                </span>
                {product.compareAtPrice > product.price && (
                  <span className="text-sm text-slate-400 line-through">
                    ₹{product.compareAtPrice.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                {product.description}
              </p>

              {/* Stock */}
              <p className={`text-xs font-semibold ${product.countInStock > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                {product.countInStock > 0
                  ? `✓ In Stock (${product.countInStock} available)`
                  : '✗ Out of Stock'}
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <div className="flex space-x-2">
                <button
                  onClick={handleAddToCart}
                  disabled={product.countInStock === 0}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    product.countInStock === 0
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20'
                  }`}
                >
                  <ShoppingCart size={16} />
                  <span>Add to Cart</span>
                </button>
                <button
                  onClick={handleWishlist}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all ${
                    wishlisted
                      ? 'bg-rose-500 border-rose-500 text-white'
                      : 'border-slate-200 text-slate-500 hover:border-rose-300 hover:text-rose-500'
                  }`}
                >
                  <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
                </button>
              </div>
              <Link
                to={`/product/${product._id}`}
                onClick={onClose}
                className="flex items-center justify-center space-x-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 py-1.5 transition-colors"
              >
                <span>View Full Details</span>
                <ExternalLink size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
