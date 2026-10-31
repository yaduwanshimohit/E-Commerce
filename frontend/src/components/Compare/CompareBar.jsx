import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Scale, X, ArrowRight } from 'lucide-react';
import { removeFromCompare, clearCompare } from '../../redux/slices/compareSlice';

const CompareBar = () => {
  const dispatch = useDispatch();
  const { compareItems } = useSelector((state) => state.compare);

  if (compareItems.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 sm:right-8 z-50 bg-slate-950 text-white p-4 rounded-3xl border border-slate-800 shadow-2xl flex items-center gap-4 max-w-xl animate-fade-in-up">
      <div className="flex items-center gap-2 pr-2 border-r border-slate-800">
        <Scale className="text-purple-400" size={20} />
        <div>
          <h4 className="font-extrabold text-xs text-white">Compare ({compareItems.length}/4)</h4>
          <button
            onClick={() => dispatch(clearCompare())}
            className="text-[10px] text-slate-400 hover:text-rose-400 font-semibold"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {compareItems.map((item) => (
          <div key={item._id} className="relative group">
            <div className="w-10 h-10 rounded-xl bg-white p-1 border border-slate-700 flex items-center justify-center">
              <img src={item.images?.[0]} alt={item.name} className="max-h-full max-w-full object-contain" />
            </div>
            <button
              onClick={() => dispatch(removeFromCompare(item._id))}
              className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white rounded-full flex items-center justify-center text-[10px] shadow"
            >
              <X size={10} />
            </button>
          </div>
        ))}
      </div>

      <Link
        to="/compare"
        className="ml-auto px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-1 whitespace-nowrap active:scale-95"
      >
        Compare Now <ArrowRight size={14} />
      </Link>
    </div>
  );
};

export default CompareBar;
