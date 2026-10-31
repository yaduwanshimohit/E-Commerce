import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Package,
  CheckCircle,
  Truck,
  Clock,
  ChevronRight,
  AlertCircle,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import Loader from '../components/Loader/Loader';
import ConfirmDialog from '../components/ConfirmDialog/ConfirmDialog';
import { fetchMyOrders, cancelOrderThunk } from '../redux/slices/orderSlice';

const orderStatusSteps = [
  'PLACED',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

const MyOrders = () => {
  const dispatch = useDispatch();

  const { orders, loading } = useSelector((state) => state.orders);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedOrderToCancel, setSelectedOrderToCancel] = useState(null);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  const handleCancelClick = (order) => {
    setSelectedOrderToCancel(order);
    setCancelModalOpen(true);
  };

  const confirmCancelOrder = () => {
    if (selectedOrderToCancel) {
      dispatch(cancelOrderThunk(selectedOrderToCancel._id));
    }
  };

  const getStepProgressIndex = (status) => {
    if (status === 'CANCELLED') return -1;
    if (status === 'RETURNED' || status === 'RETURN_REQUESTED') return 5;
    return orderStatusSteps.indexOf(status);
  };

  if (loading) return <Loader message="Loading your orders..." />;

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Package size={48} />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">No Orders Found</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-8">
          You haven't placed any orders yet. Check out our latest products and place your first order!
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
      
      <Breadcrumb items={[{ label: 'My Orders' }]} />

      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <Package className="text-blue-600" /> My Orders ({orders.length})
        </h1>
      </div>

      <div className="space-y-6">
        {orders.map((order) => {
          const currentStepIdx = getStepProgressIndex(order.orderStatus);
          const isCancelled = order.orderStatus === 'CANCELLED';

          return (
            <div
              key={order._id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6 hover:shadow-md transition-shadow"
            >
              {/* Top Header Card */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block">Order ID</span>
                  <span className="font-extrabold text-slate-900 text-sm">#{order._id}</span>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold block">Order Date</span>
                  <span className="font-semibold text-slate-800">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold block">Total Amount</span>
                  <span className="font-black text-slate-900 text-sm">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold block">Payment Status</span>
                  <span
                    className={`font-bold uppercase px-2.5 py-0.5 rounded ${
                      order.paymentStatus === 'PAID'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {order.paymentStatus} ({order.paymentMethod})
                  </span>
                </div>

                <Link
                  to={`/orders/${order._id}`}
                  className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors"
                >
                  View Details <ChevronRight size={14} />
                </Link>
              </div>

              {/* Order Tracking Visual Timeline Progress Bar */}
              {!isCancelled ? (
                <div className="py-2">
                  <div className="flex items-center justify-between relative">
                    {/* Connecting line */}
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0"></div>
                    <div
                      className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-500"
                      style={{
                        width: `${(Math.max(0, currentStepIdx) / (orderStatusSteps.length - 1)) * 100}%`,
                      }}
                    ></div>

                    {orderStatusSteps.map((step, idx) => {
                      const isCompleted = currentStepIdx >= idx;
                      return (
                        <div key={step} className="relative z-10 flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition-all ${
                              isCompleted ? 'bg-blue-600 text-white scale-110' : 'bg-white border-2 border-slate-300 text-slate-400'
                            }`}
                          >
                            {isCompleted ? <CheckCircle size={16} /> : idx + 1}
                          </div>
                          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mt-1.5 hidden sm:block">
                            {step.replace(/_/g, ' ')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                  <XCircle size={16} /> This order was cancelled.
                </div>
              )}

              {/* Order Items Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {order.orderItems?.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-xl bg-slate-50">
                    <img src={item.image} alt={item.name} className="w-12 h-12 object-contain rounded-lg bg-white p-1" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-xs text-slate-900 truncate">{item.name}</h4>
                      <p className="text-[11px] text-slate-500">
                        Qty: <strong>{item.quantity}</strong> | ₹{item.price?.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                {!isCancelled && ['PLACED', 'CONFIRMED', 'PROCESSING'].includes(order.orderStatus) && (
                  <button
                    onClick={() => handleCancelClick(order)}
                    className="px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors"
                  >
                    Cancel Order
                  </button>
                )}

                {order.orderStatus === 'DELIVERED' && (
                  <Link
                    to={`/orders/${order._id}`}
                    className="px-4 py-2 text-xs font-bold text-purple-600 hover:bg-purple-50 border border-purple-200 rounded-xl transition-colors flex items-center gap-1"
                  >
                    <RotateCcw size={14} /> Return Item
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cancel Order Confirmation Dialog */}
      <ConfirmDialog
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={confirmCancelOrder}
        title="Cancel Order Confirmation"
        message="Are you sure you want to cancel this order? Item stocks will be automatically restored."
        confirmText="Yes, Cancel Order"
        isDanger={true}
      />

    </div>
  );
};

export default MyOrders;
