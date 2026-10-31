import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingBag, ArrowRight, Tag, ShieldCheck, Trash2, ArrowLeft } from 'lucide-react';
import CartItem from '../components/CartItem/CartItem';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import { applyCouponThunk, removeCoupon } from '../redux/slices/couponSlice';
import { clearCart } from '../redux/slices/cartSlice';

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { cartItems } = useSelector((state) => state.cart);
  const { appliedCoupon, loading: couponLoading } = useSelector((state) => state.coupon);
  const { userInfo } = useSelector((state) => state.auth);

  const [couponCodeInput, setCouponCodeInput] = useState('');

  // Price Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.discountPrice * item.quantity, 0);
  const originalSubtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalSavings = originalSubtotal - subtotal;

  const shippingFee = subtotal > 499 || cartItems.length === 0 ? 0 : 50;

  let couponDiscount = 0;
  if (appliedCoupon) {
    couponDiscount = appliedCoupon.discountAmount;
  }

  const grandTotal = Math.max(0, subtotal - couponDiscount + shippingFee);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    dispatch(applyCouponThunk({ code: couponCodeInput.trim(), cartTotal: subtotal }));
  };

  const handleProceedToCheckout = () => {
    if (!userInfo) {
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Your Shopping Cart is Empty</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-8">
          Looks like you haven't added any items to your cart yet. Explore our latest electronics and fashion deals!
        </p>
        <Link
          to="/products"
          className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-lg transition-all"
        >
          Start Shopping Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      <Breadcrumb items={[{ label: 'Shopping Cart' }]} />

      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <ShoppingBag className="text-blue-600" /> Shopping Cart ({cartItems.length} items)
        </h1>
        <button
          onClick={() => dispatch(clearCart())}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
        >
          <Trash2 size={14} /> Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {cartItems.map((item) => (
            <CartItem key={item.product} item={item} />
          ))}

          <div className="pt-4 flex justify-between items-center">
            <Link
              to="/products"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <ArrowLeft size={16} /> Continue Shopping
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary & Coupon */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Coupon Promo Box */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Tag size={16} className="text-blue-600" /> Apply Coupon Code
            </h3>

            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                <div>
                  <span className="font-extrabold text-xs text-emerald-800 uppercase tracking-wider block">
                    {appliedCoupon.code} APPLIED
                  </span>
                  <span className="text-[11px] text-emerald-600">
                    You saved ₹{appliedCoupon.discountAmount}!
                  </span>
                </div>
                <button
                  onClick={() => dispatch(removeCoupon())}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code (WELCOME100)"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value)}
                  className="flex-1 uppercase px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 bg-slate-50"
                />
                <button
                  type="submit"
                  disabled={couponLoading}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors"
                >
                  Apply
                </button>
              </form>
            )}

            <div className="text-[11px] text-slate-400">
              Try code <strong className="text-slate-700">WELCOME100</strong> for ₹100 OFF or <strong className="text-slate-700">FESTIVE20</strong> for 20% OFF.
            </div>
          </div>

          {/* Cart Order Summary Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 pb-3 border-b border-slate-100">
              Order Summary
            </h3>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal ({cartItems.length} items)</span>
                <span className="font-semibold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {totalSavings > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Product Discount</span>
                  <span>- ₹{totalSavings.toLocaleString('en-IN')}</span>
                </div>
              )}

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span>- ₹{couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery Charge</span>
                {shippingFee === 0 ? (
                  <span className="font-bold text-emerald-600">FREE</span>
                ) : (
                  <span className="font-semibold text-slate-900">₹{shippingFee}</span>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <div>
                <span className="text-sm font-extrabold text-slate-900 block">Grand Total</span>
                <span className="text-[10px] text-slate-400">Inclusive of all taxes</span>
              </div>
              <span className="text-2xl font-black text-blue-600">
                ₹{grandTotal.toLocaleString('en-IN')}
              </span>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-2xl shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-2">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Safe & Secure 256-bit Razorpay Checkout</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Cart;
