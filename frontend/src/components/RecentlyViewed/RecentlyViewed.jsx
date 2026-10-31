import React from 'react';
import { useSelector } from 'react-redux';
import { Clock } from 'lucide-react';
import ProductCard from '../ProductCard/ProductCard';

const RecentlyViewed = ({ currentProductId }) => {
  const { items } = useSelector((state) => state.recentlyViewed);

  // Filter out currently viewed product if specified
  const displayItems = currentProductId
    ? items.filter((p) => p._id !== currentProductId)
    : items;

  if (displayItems.length === 0) return null;

  return (
    <section className="space-y-4 pt-6 border-t border-slate-200">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <Clock className="text-purple-600" size={20} /> Recently Viewed Products
        </h3>
        <span className="text-xs font-semibold text-slate-500">Your Browsing History</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayItems.slice(0, 4).map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default RecentlyViewed;
