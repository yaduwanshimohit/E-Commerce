import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Trash2, Plus, Minus, Heart } from 'lucide-react';
import { updateCartQuantity, removeFromCart } from '../../redux/slices/cartSlice';
import { toggleWishlist } from '../../redux/slices/wishlistSlice';

const CartItem = ({ item }) => {
  const dispatch = useDispatch();
  const cartItemId = item.cartItemId || (item.variantId ? `${item.product}-${item.variantId}` : item.product);

  const handleIncrease = () => {
    dispatch(updateCartQuantity({ cartItemId, productId: item.product, quantity: item.quantity + 1 }));
  };

  const handleDecrease = () => {
    if (item.quantity > 1) {
      dispatch(updateCartQuantity({ cartItemId, productId: item.product, quantity: item.quantity - 1 }));
    } else {
      dispatch(removeFromCart({ cartItemId, productId: item.product }));
    }
  };

  const handleRemove = () => {
    dispatch(removeFromCart({ cartItemId, productId: item.product }));
  };

  const handleMoveToWishlist = () => {
    dispatch(
      toggleWishlist({
        _id: item.product,
        name: item.name,
        images: [item.image],
        price: item.price,
        discountPrice: item.discountPrice || item.price,
      })
    );
    dispatch(removeFromCart({ cartItemId, productId: item.product }));
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow gap-4">
      {/* Product Image & Title */}
      <div className="flex items-center gap-4 flex-1 w-full sm:w-auto">
        <Link to={`/products/${item.product}`} className="w-20 h-20 rounded-xl bg-slate-50 border border-slate-100 p-2 flex-shrink-0 flex items-center justify-center">
          <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
        </Link>

        <div className="flex-1 min-w-0">
          <Link to={`/products/${item.product}`} className="font-semibold text-sm text-slate-900 hover:text-blue-600 line-clamp-2 transition-colors">
            {item.name}
          </Link>
          
          {item.variantInfo && (
            <div className="mt-1">
              <span className="inline-block bg-purple-50 text-purple-700 text-[11px] font-bold px-2 py-0.5 rounded-md border border-purple-200">
                {item.variantInfo}
              </span>
            </div>
          )}

          <div className="text-xs text-slate-500 mt-1">
            Price: <strong className="text-slate-800">₹{item.discountPrice?.toLocaleString('en-IN')}</strong>
            {item.price > item.discountPrice && (
              <span className="line-through text-slate-400 ml-1.5">₹{item.price?.toLocaleString('en-IN')}</span>
            )}
          </div>
          
          <button
            onClick={handleMoveToWishlist}
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium mt-2"
          >
            <Heart size={13} /> Save to Wishlist
          </button>
        </div>
      </div>

      {/* Quantity Selector & Item Subtotal */}
      <div className="flex items-center justify-between w-full sm:w-auto sm:gap-8 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
        
        {/* Quantity Controls */}
        <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
          <button
            onClick={handleDecrease}
            className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <Minus size={14} />
          </button>
          <span className="w-10 text-center font-bold text-sm text-slate-800">{item.quantity}</span>
          <button
            onClick={handleIncrease}
            className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Item Total Price */}
        <div className="text-right">
          <div className="text-base font-bold text-slate-900">
            ₹{(item.discountPrice * item.quantity).toLocaleString('en-IN')}
          </div>
          <button
            onClick={handleRemove}
            className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 justify-end mt-1"
          >
            <Trash2 size={13} /> Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
