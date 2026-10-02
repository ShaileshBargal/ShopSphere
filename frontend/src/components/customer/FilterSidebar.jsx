import React from 'react';
import { Filter, RotateCcw, Star } from 'lucide-react';

const FilterSidebar = ({
  categories = [],
  selectedCategory,
  onSelectCategory,
  priceRange,
  onChangePriceRange,
  inStockOnly,
  onToggleInStock,
  minRating,
  onSelectRating,
  onResetFilters,
}) => {
  return (
    <aside className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
          <Filter size={16} className="text-teal-600" />
          <span>Filter Products</span>
        </div>
        <button
          onClick={onResetFilters}
          className="text-xs text-slate-400 hover:text-teal-600 flex items-center space-x-1 font-medium transition-colors"
          title="Reset all filters"
        >
          <RotateCcw size={12} />
          <span>Reset</span>
        </button>
      </div>

      {/* Category Filter */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
          Categories
        </h4>
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          <button
            onClick={() => onSelectCategory('all')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedCategory === 'all' || !selectedCategory
                ? 'bg-teal-50 text-teal-700 font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => onSelectCategory(cat.slug || cat._id)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === cat.slug || selectedCategory === cat._id
                  ? 'bg-teal-50 text-teal-700 font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="truncate">{cat.name}</span>
              {cat.productCount !== undefined && (
                <span className="text-[10px] text-slate-400 ml-1">({cat.productCount})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Max Price:
          </h4>
          <span className="text-xs font-bold text-teal-700">₹{priceRange}</span>
        </div>
        <input
          type="range"
          min="10"
          max="1000"
          step="10"
          value={priceRange}
          onChange={(e) => onChangePriceRange(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
        />
        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
          <span>₹10</span>
          <span>₹500</span>
          <span>₹1000+</span>
        </div>
      </div>

      {/* Customer Rating Filter */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          Minimum Rating
        </h4>
        <div className="space-y-1">
          {[4, 3, 2].map((stars) => (
            <button
              key={stars}
              onClick={() => onSelectRating(minRating === stars ? null : stars)}
              className={`w-full flex items-center space-x-2 px-2 py-1.5 rounded-lg text-xs transition-colors ${
                minRating === stars
                  ? 'bg-teal-50 text-teal-800 font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex text-amber-400">
                {Array.from({ length: stars }).map((_, i) => (
                  <Star key={i} size={13} className="fill-amber-400" />
                ))}
              </div>
              <span className="text-[11px]">& Up</span>
            </button>
          ))}
        </div>
      </div>

      {/* In-Stock Filter */}
      <div className="pt-2 border-t border-slate-100">
        <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-medium text-slate-700 select-none">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onToggleInStock(e.target.checked)}
            className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
          />
          <span>In-Stock Only</span>
        </label>
      </div>
    </aside>
  );
};

export default FilterSidebar;
