import React from 'react';
import { Star } from 'lucide-react';

const RatingStars = ({ rating = 0, reviewsCount, showNumber = true, size = 16 }) => {
  return (
    <div className="flex items-center space-x-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={`${
              rating >= star
                ? 'text-amber-400 fill-amber-400'
                : rating >= star - 0.5
                ? 'text-amber-400 fill-amber-400/50'
                : 'text-slate-200 fill-slate-100'
            }`}
          />
        ))}
      </div>
      {showNumber && (
        <span className="text-xs font-semibold text-slate-700 ml-1">
          {Number(rating).toFixed(1)}
        </span>
      )}
      {reviewsCount !== undefined && (
        <span className="text-xs text-slate-400 ml-1">({reviewsCount})</span>
      )}
    </div>
  );
};

export default RatingStars;
