import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, ShoppingBag, Check, Zap, Scale } from 'lucide-react';
import RatingStars from '../Rating/RatingStars';
import { addToCart } from '../../redux/slices/cartSlice';
import { toggleWishlist } from '../../redux/slices/wishlistSlice';
import { addToCompare, removeFromCompare } from '../../redux/slices/compareSlice';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { wishlistItems } = useSelector((state) => state.wishlist);
  const { cartItems } = useSelector((state) => state.cart);
  const { compareItems } = useSelector((state) => state.compare);

  if (!product) return null;

  const isWishlisted = wishlistItems.some((item) => item._id === product._id);
  const isInCart = cartItems.some((item) => item.product === product._id);
  const isCompared = compareItems.some((item) => item._id === product._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      addToCart({
        product: product._id,
        name: product.name,
        image: product.images[0],
        price: product.price,
        discountPrice: product.discountPrice,
        stock: product.stock,
        quantity: 1,
      })
    );
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleWishlist(product));
  };

  const handleToggleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCompared) {
      dispatch(removeFromCompare(product._id));
    } else {
      dispatch(addToCompare(product));
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/80 hover:border-blue-500/40 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* Discount & Flash Sale Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {product.discountPercent > 0 && (
          <span className="bg-gradient-to-r from-red-600 to-rose-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
            {product.discountPercent}% OFF
          </span>
        )}
        {product.isFlashSale && (
          <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            <Zap size={10} className="fill-slate-950" /> FLASH SALE
          </span>
        )}
      </div>

      {/* Top Right Action Buttons: Wishlist & Compare */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
        <button
          onClick={handleToggleWishlist}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
            isWishlisted
              ? 'bg-rose-50 text-rose-600 shadow-md scale-105'
              : 'bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white shadow-sm'
          }`}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart size={16} className={isWishlisted ? 'fill-rose-600' : ''} />
        </button>

        <button
          onClick={handleToggleCompare}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
            isCompared
              ? 'bg-blue-600 text-white shadow-md scale-105'
              : 'bg-white/90 text-slate-400 hover:text-blue-600 hover:bg-white shadow-sm'
          }`}
          title={isCompared ? 'Remove from Compare' : 'Add to Compare'}
        >
          <Scale size={15} />
        </button>
      </div>

      {/* Product Image Link */}
      <Link to={`/products/${product.slug || product._id}`} className="block relative pt-[90%] overflow-hidden bg-slate-50">
        <img
          src={product.images && product.images[0] ? product.images[0] : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-108 transition-transform duration-500"
          loading="lazy"
        />
      </Link>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          {product.brand}
        </div>

        <Link
          to={`/products/${product.slug || product._id}`}
          className="font-medium text-slate-900 text-sm line-clamp-2 hover:text-blue-600 transition-colors mb-2 min-h-[40px]"
        >
          {product.name}
        </Link>

        {/* Rating */}
        <div className="mb-3">
          <RatingStars rating={product.rating} numReviews={product.numReviews} size={14} />
        </div>

        {/* Price & Stock */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-slate-900">
                ₹{product.discountPrice?.toLocaleString('en-IN')}
              </span>
              {product.price > product.discountPrice && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{product.price?.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            <div className="text-[11px] font-medium mt-0.5">
              {product.stock > 0 ? (
                <span className="text-emerald-600 font-semibold">In Stock</span>
              ) : (
                <span className="text-rose-500 font-semibold">Out of Stock</span>
              )}
            </div>
          </div>

          {/* Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 shadow-sm ${
              product.stock <= 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : isInCart
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
            }`}
          >
            {isInCart ? (
              <>
                <Check size={14} /> Added
              </>
            ) : (
              <>
                <ShoppingBag size={14} /> Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
