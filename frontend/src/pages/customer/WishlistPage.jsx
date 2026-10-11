import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, ArrowLeft, PackageSearch, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

const WishlistPage = () => {
  const { user } = useAuth();
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleAddToCart = (product) => {
    if (!user) {
      showToast('Please sign in to add items to your cart', 'info');
      navigate('/login', { state: { from: location } });
      return;
    }

    if (product.countInStock === 0) {
      showToast('This product is currently out of stock.', 'warning');
      return;
    }

    const result = addToCart(product, 1);
    if (result?.requireAuth) {
      showToast('Please sign in to add items to your cart', 'info');
      navigate('/login', { state: { from: location } });
      return;
    }
    showToast(`"${product.name}" added to cart!`, 'success');
  };

  const handleRemove = (product) => {
    removeFromWishlist(product._id);
    showToast(`Removed from wishlist`, 'info');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2.5 mb-1">
            <Heart size={22} className="text-rose-500 fill-rose-500" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Wishlist</h1>
          </div>
          <p className="text-xs text-slate-500">
            {wishlistItems.length > 0
              ? `${wishlistItems.length} saved item${wishlistItems.length !== 1 ? 's' : ''}`
              : 'No saved items yet'}
          </p>
        </div>
        <Link
          to="/products"
          className="flex items-center space-x-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Continue Shopping</span>
        </Link>
      </div>

      {wishlistItems.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center space-y-5 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center mx-auto">
            <Heart size={36} className="text-rose-300" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Your wishlist is empty</h2>
            <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              Save products you love by clicking the heart icon on any product card.
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3 rounded-xl shadow-md shadow-teal-600/20 text-sm transition-all"
          >
            <PackageSearch size={16} />
            <span>Browse Products</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {wishlistItems.map((product) => {
            const discountPercent =
              product.compareAtPrice > product.price
                ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
                : null;

            return (
              <div
                key={product._id}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
              >
                {/* Image */}
                <Link to={`/product/${product._id}`} className="block relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {discountPercent && (
                    <span className="absolute top-3 left-3 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      -{discountPercent}%
                    </span>
                  )}
                </Link>

                {/* Body */}
                <div className="p-4 space-y-3">
                  {product.vendor?.storeName && (
                    <p className="text-[10px] font-bold uppercase tracking-wider text-teal-600 truncate">
                      {product.vendor.storeName}
                    </p>
                  )}
                  <Link to={`/product/${product._id}`}>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-2 hover:text-teal-700 transition-colors">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Rating */}
                  <div className="flex items-center space-x-1.5">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={11}
                          className={s <= Math.round(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400">({product.numReviews})</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-base font-black text-slate-900">₹{product.price.toFixed(2)}</span>
                    {product.compareAtPrice > product.price && (
                      <span className="text-xs text-slate-400 line-through">₹{product.compareAtPrice.toFixed(2)}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-1">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.countInStock === 0}
                      className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        product.countInStock === 0
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm'
                      }`}
                    >
                      <ShoppingCart size={13} />
                      <span>{product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                    </button>
                    <button
                      onClick={() => handleRemove(product)}
                      className="w-9 h-9 rounded-xl border border-slate-200 text-slate-400 hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
