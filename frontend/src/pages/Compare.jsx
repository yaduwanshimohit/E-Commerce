import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Scale, Trash2, ShoppingBag, Check, X, ArrowLeft, Star } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import RatingStars from '../components/Rating/RatingStars';
import { removeFromCompare, clearCompare } from '../redux/slices/compareSlice';
import { addToCart } from '../redux/slices/cartSlice';

const Compare = () => {
  const dispatch = useDispatch();
  const { compareItems } = useSelector((state) => state.compare);
  const [highlightDifferences, setHighlightDifferences] = useState(false);

  if (compareItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto border border-purple-200">
          <Scale size={32} />
        </div>
        <h2 className="text-2xl font-black text-slate-900">No Products Selected for Comparison</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Add up to 4 products from the catalog or product details page to compare specifications side-by-side.
        </p>
        <Link to="/products" className="mt-4 inline-block px-6 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow">
          Explore Products Catalog
        </Link>
      </div>
    );
  }

  // Collect all unique specification keys across selected products
  const allSpecKeys = Array.from(
    new Set(
      compareItems.flatMap((item) => item.specifications?.map((s) => s.key) || [])
    )
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      <Breadcrumb items={[{ label: 'Catalog', link: '/products' }, { label: 'Product Comparison' }]} />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <Link to="/products" className="text-xs font-bold text-blue-600 flex items-center gap-1 mb-2 hover:underline">
            <ArrowLeft size={14} /> Back to Products Catalog
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
            <Scale className="text-purple-600" /> Side-by-Side Product Comparison ({compareItems.length}/4)
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={highlightDifferences}
              onChange={(e) => setHighlightDifferences(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded"
            />
            Highlight Differences
          </label>

          <button
            onClick={() => dispatch(clearCompare())}
            className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs rounded-xl border border-rose-200"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="p-4 w-48 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Specification</th>
                {compareItems.map((item) => (
                  <th key={item._id} className="p-4 min-w-[220px] max-w-[260px] align-top border-l border-slate-200">
                    <div className="space-y-3">
                      <div className="relative group">
                        <img src={item.images?.[0]} alt={item.name} className="w-32 h-32 object-contain bg-white rounded-2xl p-2 mx-auto border border-slate-200" />
                        <button
                          onClick={() => dispatch(removeFromCompare(item._id))}
                          className="absolute top-0 right-0 p-1 bg-rose-600 text-white rounded-full shadow"
                          title="Remove from comparison"
                        >
                          <X size={12} />
                        </button>
                      </div>

                      <Link to={`/products/${item.slug || item._id}`} className="font-bold text-sm text-slate-900 hover:text-blue-600 line-clamp-2 transition-colors block text-center">
                        {item.name}
                      </Link>

                      <div className="text-center space-y-1">
                        <span className="text-xs font-extrabold text-purple-600 uppercase tracking-wider">{item.brand}</span>
                        <div className="flex items-center justify-center gap-1">
                          <RatingStars rating={item.rating} size={13} showNumber={false} />
                          <span className="font-bold text-slate-700">({item.rating})</span>
                        </div>
                        <div className="text-base font-black text-slate-900">
                          ₹{item.discountPrice?.toLocaleString('en-IN')}{' '}
                          {item.price > item.discountPrice && (
                            <span className="text-xs text-slate-400 line-through font-normal">₹{item.price?.toLocaleString('en-IN')}</span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          dispatch(
                            addToCart({
                              product: item._id,
                              name: item.name,
                              image: item.images?.[0],
                              price: item.price,
                              discountPrice: item.discountPrice,
                              stock: item.stock,
                              quantity: 1,
                            })
                          )
                        }
                        className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1"
                      >
                        <ShoppingBag size={14} /> Add to Cart
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              
              {/* Basic Overview Rows */}
              <tr>
                <td className="p-4 font-bold text-slate-700 bg-slate-50">Stock Availability</td>
                {compareItems.map((item) => (
                  <td key={item._id} className="p-4 border-l border-slate-200">
                    {item.stock > 0 ? (
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px] inline-flex items-center gap-1">
                        <Check size={12} /> In Stock ({item.stock})
                      </span>
                    ) : (
                      <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded text-[11px]">Out of Stock</span>
                    )}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold text-slate-700 bg-slate-50">Warranty</td>
                {compareItems.map((item) => (
                  <td key={item._id} className="p-4 border-l border-slate-200 text-slate-700 font-medium">
                    {item.warranty || '1 Year Brand Warranty'}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold text-slate-700 bg-slate-50">Return Policy</td>
                {compareItems.map((item) => (
                  <td key={item._id} className="p-4 border-l border-slate-200 text-slate-700 font-medium">
                    {item.returnPolicy || '7 Days Replacement'}
                  </td>
                ))}
              </tr>

              {/* Dynamic Technical Specifications Matrix */}
              {allSpecKeys.map((key) => {
                const values = compareItems.map((item) => {
                  const spec = item.specifications?.find((s) => s.key === key);
                  return spec ? spec.value : 'N/A';
                });

                const isDifferent = new Set(values).size > 1;

                return (
                  <tr
                    key={key}
                    className={highlightDifferences && isDifferent ? 'bg-amber-50/60' : ''}
                  >
                    <td className="p-4 font-bold text-slate-800 bg-slate-50 flex items-center justify-between">
                      <span>{key}</span>
                      {highlightDifferences && isDifferent && (
                        <span className="text-[9px] font-extrabold text-amber-800 bg-amber-200 px-1.5 py-0.2 rounded">Diff</span>
                      )}
                    </td>
                    {compareItems.map((item) => {
                      const spec = item.specifications?.find((s) => s.key === key);
                      return (
                        <td key={item._id} className="p-4 border-l border-slate-200 text-slate-800 font-semibold">
                          {spec ? spec.value : <span className="text-slate-400 font-normal">N/A</span>}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Compare;
