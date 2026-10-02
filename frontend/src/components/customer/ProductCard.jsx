import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Eye, Tag, Zap } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import QuickViewModal from './QuickViewModal';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { showToast } = useToast();
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
    if (product.countInStock === 0) return;
    setAddingToCart(true);
    addToCart(product);
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
      <div className="group relative bg-white rounded-2xl border border-slate-200/80 overflow-hidden product-card-hover shadow-sm">
        {/* Image Container */}
        <Link to={`/product/${product._id}`} className="block relative overflow-hidden aspect-[4/3] bg-slate-100">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.featured && (
              <span className="inline-flex items-center space-x-1 bg-teal-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                <Zap size={9} />
                <span>Featured</span>
              </span>
            )}
            {discountPercent && (
              <span className="inline-flex items-center space-x-1 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                <Tag size={9} />
                <span>-{discountPercent}%</span>
              </span>
            )}
            {product.countInStock === 0 && (
              <span className="bg-slate-800/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                Sold Out
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-200 ${
              wishlisted
                ? 'bg-rose-500 text-white scale-110'
                : 'bg-white/90 text-slate-400 hover:bg-rose-50 hover:text-rose-500 opacity-0 group-hover:opacity-100'
            }`}
          >
            <Heart size={15} fill={wishlisted ? 'currentColor' : 'none'} />
          </button>

          {/* Quick View Button */}
          <button
            onClick={(e) => { e.preventDefault(); setQuickViewOpen(true); }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center space-x-1.5 bg-white/95 hover:bg-white text-slate-800 text-[11px] font-bold px-4 py-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 whitespace-nowrap"
          >
            <Eye size={12} />
            <span>Quick View</span>
          </button>
        </Link>

        {/* Card Body */}
        <div className="p-4 space-y-3">
          {/* Vendor */}
          {product.vendor?.storeName && (
            <p className="text-[10px] font-semibold uppercase tracking-wider text-teal-600 truncate">
              {product.vendor.storeName}
            </p>
          )}

          {/* Product Name */}
          <Link to={`/product/${product._id}`}>
            <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 hover:text-teal-700 transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center space-x-1.5">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={12}
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

          {/* Price & CTA */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="text-base font-black text-slate-900">
                ₹{product.price.toFixed(2)}
              </span>
              {product.compareAtPrice > product.price && (
                <span className="ml-1.5 text-xs text-slate-400 line-through">
                  ₹{product.compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.countInStock === 0 || addingToCart}
              className={`flex items-center space-x-1.5 text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all duration-200 ${
                product.countInStock === 0
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : addingToCart
                  ? 'bg-teal-700 text-white scale-95'
                  : 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm hover:shadow-teal-600/25 hover:shadow-md'
              }`}
            >
              <ShoppingCart size={13} />
              <span>{addingToCart ? 'Added!' : 'Add'}</span>
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
