import React from 'react';
import { Star, StarHalf } from 'lucide-react';

const RatingStars = ({ rating = 0, numReviews, size = 16, showNumber = true }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.3 && rating % 1 <= 0.8;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center text-amber-400">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} size={size} className="fill-amber-400 text-amber-400" />
        ))}
        {hasHalfStar && <StarHalf size={size} className="fill-amber-400 text-amber-400" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} size={size} className="text-slate-300 fill-slate-100" />
        ))}
      </div>
      {showNumber && (
        <span className="text-xs font-semibold text-slate-700 ml-1">
          {rating ? rating.toFixed(1) : '0.0'}
        </span>
      )}
      {numReviews !== undefined && (
        <span className="text-xs text-slate-500">({numReviews})</span>
      )}
    </div>
  );
};

export default RatingStars;
