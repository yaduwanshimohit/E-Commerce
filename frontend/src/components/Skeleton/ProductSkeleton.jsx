import React from 'react';

const ProductSkeleton = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(count)].map((_, index) => (
        <div key={index} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm animate-pulse">
          <div className="w-full h-48 bg-slate-200 rounded-xl mb-4"></div>
          <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-slate-200 rounded w-1/2 mb-4"></div>
          <div className="flex justify-between items-center mt-auto">
            <div className="h-6 bg-slate-200 rounded w-1/3"></div>
            <div className="h-9 bg-slate-200 rounded-lg w-24"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductSkeleton;
