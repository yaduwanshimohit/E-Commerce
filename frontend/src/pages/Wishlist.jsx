import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import ProductCard from '../components/ProductCard/ProductCard';
import { clearWishlist } from '../redux/slices/wishlistSlice';

const Wishlist = () => {
  const dispatch = useDispatch();
  const { wishlistItems } = useSelector((state) => state.wishlist);

  if (wishlistItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Heart size={48} />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Your Wishlist is Empty</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-8">
          Save your favorite products to your wishlist so you can buy them anytime later!
        </p>
        <Link
          to="/products"
          className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-lg transition-all"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <Breadcrumb items={[{ label: 'My Wishlist' }]} />

      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <Heart className="text-rose-600 fill-rose-600" /> My Saved Wishlist ({wishlistItems.length} items)
        </h1>
        <button
          onClick={() => dispatch(clearWishlist())}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
        >
          <Trash2 size={14} /> Clear Wishlist
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlistItems.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
