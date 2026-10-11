import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Eye, Tag, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import QuickViewModal from './QuickViewModal';

const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const wishlisted = isWishlisted(product._id);
  const discountPercent =
    product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      showToast('Please sign in to add items to your cart', 'info');
      navigate('/login', { state: { from: location } });
      return;
    }

    if (product.countInStock === 0) return;
    setAddingToCart(true);
    const result = addToCart(product);
    if (result?.requireAuth) {
      showToast('Please sign in to add items to your cart', 'info');
      navigate('/login', { state: { from: location } });
      setAddingToCart(false);
      return;
    }
    showToast(`"${product.name}" added to cart!`, 'success');
    setTimeout(() => setAddingToCart(false), 800);
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleWishlist(product);
    showToast(
      added ? `❤️ Added to wishlist!` : `Removed from wishlist`,
      added ? 'success' : 'info'
    );
  };

  return (
    <>
      <div className="group relative bg-white rounded-2xl border border-slate-200/80 overflow-hidden product-card-hover shadow-sm flex flex-col h-full">
        {/* Image Container */}
        <Link to={`/product/${product._id}`} className="block relative overflow-hidden aspect-[4/3] bg-slate-100 flex-shrink-0">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex flex-col gap-1.5 z-10">
            {product.featured && (
              <span className="inline-flex items-center space-x-1 bg-teal-600 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full shadow-sm">
                <Zap size={9} />
                <span>Featured</span>
              </span>
            )}
            {discountPercent && (
              <span className="inline-flex items-center space-x-1 bg-rose-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full shadow-sm">
                <Tag size={9} />
                <span>-{discountPercent}%</span>
              </span>
            )}
            {product.countInStock === 0 && (
              <span className="bg-slate-800/80 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full">
                Sold Out
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            className={`absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-200 z-10 ${
              wishlisted
                ? 'bg-rose-500 text-white scale-105'
                : 'bg-white/95 text-slate-500 hover:bg-rose-50 hover:text-rose-500 opacity-90 sm:opacity-0 sm:group-hover:opacity-100'
            }`}
            title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart size={14} fill={wishlisted ? 'currentColor' : 'none'} />
          </button>

          {/* Quick View Button (Desktop/Tablet) */}
          <button
            onClick={(e) => { e.preventDefault(); setQuickViewOpen(true); }}
            className="hidden sm:flex absolute bottom-3 left-1/2 -translate-x-1/2 items-center space-x-1.5 bg-white/95 hover:bg-white text-slate-800 text-[11px] font-bold px-4 py-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 whitespace-nowrap"
          >
            <Eye size={12} />
            <span>Quick View</span>
          </button>
        </Link>

        {/* Card Body */}
        <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-2">
          <div className="space-y-1.5">
            {/* Vendor */}
            {product.vendor?.storeName && (
              <p className="text-[10px] font-semibold uppercase tracking-wider text-teal-600 truncate">
                {product.vendor.storeName}
              </p>
            )}

            {/* Product Name */}
            <Link to={`/product/${product._id}`}>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-2 hover:text-teal-700 transition-colors min-h-[2rem]">
                {product.name}
              </h3>
            </Link>

            {/* Rating */}
            <div className="flex items-center space-x-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={11}
                    className={
                      star <= Math.round(product.rating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-200 fill-slate-200'
                    }
                  />
                ))}
              </div>
              <span className="text-[10px] text-slate-400 font-medium">({product.numReviews})</span>
            </div>
          </div>

          {/* Price & CTA */}
          <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-slate-100/80 mt-auto">
            <div className="min-w-0">
              <span className="text-sm sm:text-base font-black text-slate-900 block truncate">
                ₹{product.price.toFixed(2)}
              </span>
              {product.compareAtPrice > product.price && (
                <span className="text-[10px] sm:text-xs text-slate-400 line-through block truncate -mt-0.5">
                  ₹{product.compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.countInStock === 0 || addingToCart}
              className={`flex-shrink-0 flex items-center space-x-1 text-[10px] sm:text-[11px] font-bold px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl transition-all duration-200 ${
                product.countInStock === 0
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : addingToCart
                  ? 'bg-teal-700 text-white scale-95'
                  : 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm hover:shadow-teal-600/25 hover:shadow-md'
              }`}
            >
              <ShoppingCart size={12} />
              <span>{addingToCart ? 'Added' : 'Add'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewOpen && (
        <QuickViewModal product={product} onClose={() => setQuickViewOpen(false)} />
      )}
    </>
  );
};

export default ProductCard;
