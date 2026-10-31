import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircle2, Package, ArrowRight, Home } from 'lucide-react';
import { fetchOrderById } from '../redux/slices/orderSlice';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();

  const { currentOrder: order } = useSelector((state) => state.orders);

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderById(orderId));
    }
  }, [dispatch, orderId]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-bounce">
        <CheckCircle2 size={56} />
      </div>

      <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full uppercase tracking-wider mb-2">
        ORDER CONFIRMED
      </span>

      <h1 className="text-3xl font-black text-slate-900 mb-2">Thank You For Your Order!</h1>
      <p className="text-sm text-slate-600 max-w-md mx-auto mb-8">
        Your order <strong className="text-slate-900">#{orderId?.slice(-8)}</strong> has been successfully placed. We're getting it ready to ship!
      </p>

      {order && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-left mb-8 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs text-slate-400 font-semibold block">Total Paid</span>
              <span className="text-xl font-black text-slate-900">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 font-semibold block">Payment Method</span>
              <span className="text-sm font-bold text-blue-600">{order.paymentMethod}</span>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-500 block mb-2">Delivery Address</span>
            <p className="text-xs text-slate-700 leading-relaxed">
              {order.shippingAddress?.fullName} ({order.shippingAddress?.mobileNumber})<br />
              {order.shippingAddress?.houseFlat}, {order.shippingAddress?.street}, {order.shippingAddress?.city} - {order.shippingAddress?.pincode}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          to={`/orders`}
          className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-lg flex items-center gap-2"
        >
          <Package size={18} /> View My Orders
        </Link>
        <Link
          to="/"
          className="px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-2xl flex items-center gap-2"
        >
          <Home size={18} /> Back to Home
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
