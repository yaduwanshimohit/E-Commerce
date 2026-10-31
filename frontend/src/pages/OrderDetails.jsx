import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Package,
  MapPin,
  CreditCard,
  Printer,
  RotateCcw,
  CheckCircle2,
  Truck,
  ArrowLeft,
  Copy,
  Clock,
  RefreshCw,
  AlertCircle,
  FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import Loader from '../components/Loader/Loader';
import Modal from '../components/Modal/Modal';
import TaxInvoiceModal from '../components/Invoice/TaxInvoiceModal';
import { fetchOrderById } from '../redux/slices/orderSlice';
import api from '../services/api';

const OrderDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { currentOrder: order, loading } = useSelector((state) => state.orders);

  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [requestType, setRequestType] = useState('RETURN');
  const [returnReason, setReturnReason] = useState('Defective/Damaged Item');
  const [returnDetails, setReturnDetails] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);

  useEffect(() => {
    dispatch(fetchOrderById(id));
  }, [dispatch, id]);

  const handleCopyTracking = () => {
    if (order?.trackingNumber) {
      navigator.clipboard.writeText(order.trackingNumber);
      toast.success('AWB Tracking Number copied to clipboard!');
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReturn(true);
    try {
      const { data } = await api.put(`/orders/${id}/return-request`, {
        requestType,
        returnReason,
        returnDetails,
      });
      if (data.success) {
        toast.success(data.message);
        setReturnModalOpen(false);
        dispatch(fetchOrderById(id));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Return request failed');
    } finally {
      setSubmittingReturn(false);
    }
  };

  if (loading) return <Loader message="Loading order details..." />;
  if (!order) return <div className="p-8 text-center text-sm text-slate-500">Order not found</div>;

  // Logistics Tracking Steps
  const shipmentSteps = [
    { key: 'LABEL_CREATED', label: 'Order Placed & Packed' },
    { key: 'PICKED_UP', label: 'Picked Up by Courier' },
    { key: 'IN_TRANSIT', label: 'In Transit' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { key: 'DELIVERED', label: 'Delivered' },
  ];

  const currentShipmentStep = shipmentSteps.findIndex((s) => s.key === (order.shipmentStatus || 'LABEL_CREATED'));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      <Breadcrumb items={[{ label: 'My Orders', link: '/orders' }, { label: `Order #${order._id.slice(-8)}` }]} />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <Link to="/orders" className="text-xs font-bold text-blue-600 flex items-center gap-1 mb-2 hover:underline">
            <ArrowLeft size={14} /> Back to My Orders
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
            Order #{order._id}
          </h1>
          <span className="text-xs text-slate-500 mt-1 block">
            Placed on {new Date(order.createdAt).toLocaleString('en-IN')}
          </span>
        </div>

        <button
          onClick={() => setInvoiceModalOpen(true)}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow"
        >
          <FileText size={16} /> View GST Tax Invoice
        </button>
      </div>

      {/* Logistics & Shipment Tracking Timeline */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 rounded-3xl border border-slate-800 text-white space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-400">Live Logistics Tracking</span>
            <h3 className="text-lg font-black text-white flex items-center gap-2 mt-0.5">
              <Truck className="text-purple-400" /> {order.courierPartner || 'Delhivery Express'}
            </h3>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/90 px-4 py-2 rounded-2xl border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">AWB Tracking Number</span>
              <span className="font-mono font-bold text-xs text-purple-300">{order.trackingNumber || 'AWB-PENDING'}</span>
            </div>
            {order.trackingNumber && (
              <button
                onClick={handleCopyTracking}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                title="Copy Tracking Number"
              >
                <Copy size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Step Progress Tracker */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 relative">
          {shipmentSteps.map((step, idx) => {
            const isDone = idx <= currentShipmentStep;
            return (
              <div key={step.key} className="flex flex-col items-center text-center space-y-2">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs transition-all ${
                    isDone
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40 border border-purple-400'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  {isDone ? <CheckCircle2 size={18} /> : idx + 1}
                </div>
                <span className={`text-[11px] font-bold ${isDone ? 'text-purple-200' : 'text-slate-500'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {order.estimatedDeliveryDate && (
          <div className="text-xs text-purple-200 bg-purple-950/40 p-3 rounded-xl border border-purple-800/40 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-semibold">
              <Clock size={15} className="text-purple-400" /> Estimated Delivery Date:
            </span>
            <strong className="text-white text-sm">
              {new Date(order.estimatedDeliveryDate).toLocaleDateString('en-IN', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </strong>
          </div>
        )}
      </div>

      {/* 3-Column Summary Cards with Distinct Status Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Shipping Address */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin size={16} className="text-blue-600" /> Delivery Address
          </h4>
          <p className="font-bold text-sm text-slate-900">{order.shippingAddress?.fullName}</p>
          <p className="text-xs text-slate-600 leading-relaxed">
            {order.shippingAddress?.houseFlat}, {order.shippingAddress?.street}, {order.shippingAddress?.area}<br />
            {order.shippingAddress?.city}, {order.shippingAddress?.state} - <strong>{order.shippingAddress?.pincode}</strong>
          </p>
          <p className="text-xs text-slate-500 font-semibold">Mobile: +91 {order.shippingAddress?.mobileNumber}</p>
        </div>

        {/* Payment & Refund Details */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <CreditCard size={16} className="text-blue-600" /> Payment & Refund Status
          </h4>
          <p className="font-bold text-sm text-slate-900">Method: {order.paymentMethod}</p>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Payment:</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${order.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              {order.paymentStatus}
            </span>
          </div>

          {/* Refund Status */}
          {order.refundStatus && order.refundStatus !== 'NOT_APPLICABLE' && (
            <div className="flex items-center gap-2 text-xs pt-1 border-t border-slate-100">
              <span className="text-slate-500">Refund:</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-100 text-purple-800">
                {order.refundStatus}
              </span>
            </div>
          )}

          {order.refundAmount > 0 && (
            <p className="text-xs text-emerald-700 font-bold">
              Refund Amount: ₹{order.refundAmount.toLocaleString('en-IN')}
            </p>
          )}
        </div>

        {/* Return / Replacement Status & Actions */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <RotateCcw size={16} className="text-blue-600" /> Return & Replacement
          </h4>

          <div className="space-y-1">
            <p className="text-xs text-slate-500">Return Window: <strong className="text-slate-800">7 Days Replacement</strong></p>
            {order.returnStatus && order.returnStatus !== 'NONE' && (
              <div className="mt-1">
                <span className="inline-block px-2.5 py-1 bg-purple-100 text-purple-900 font-extrabold text-[11px] rounded-lg border border-purple-200">
                  {order.returnStatus.replace(/_/g, ' ')}
                </span>
              </div>
            )}
          </div>

          {order.orderStatus === 'DELIVERED' && (!order.returnStatus || order.returnStatus === 'NONE') && (
            <button
              onClick={() => setReturnModalOpen(true)}
              className="mt-3 w-full py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-purple-200 transition-colors"
            >
              <RotateCcw size={15} /> Request Return or Replacement
            </button>
          )}
        </div>

      </div>

      {/* Ordered Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3">Ordered Items</h3>
        <div className="divide-y divide-slate-100">
          {order.orderItems?.map((item, idx) => (
            <div key={idx} className="py-4 flex items-center gap-4">
              <img src={item.image} alt={item.name} className="w-16 h-16 object-contain rounded-xl bg-slate-50 p-1 border border-slate-100" />
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.product}`} className="font-semibold text-sm text-slate-900 hover:text-blue-600 transition-colors">
                  {item.name}
                </Link>
                {item.variantInfo && (
                  <p className="text-xs text-purple-700 font-bold mt-0.5">{item.variantInfo}</p>
                )}
                <div className="text-xs text-slate-400 mt-0.5 flex gap-3">
                  {item.sku && <span>SKU: {item.sku}</span>}
                  <span>HSN: {item.hsnCode || '8517'}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-sm text-slate-900">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </div>
                <span className="text-xs text-slate-500">₹{item.price?.toLocaleString('en-IN')} x {item.quantity}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Summary */}
        <div className="pt-4 border-t border-slate-200 max-w-xs ml-auto space-y-2 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Items Subtotal</span>
            <span>₹{order.subtotal?.toLocaleString('en-IN')}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Coupon Discount</span>
              <span>- ₹{order.discountAmount?.toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>GST Tax (Included 18%)</span>
            <span>₹{order.taxAmount?.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping Charge</span>
            <span>{order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-extrabold text-slate-900">
            <span>Final Total Amount</span>
            <span className="text-blue-600">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Tax Invoice Modal */}
      <TaxInvoiceModal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        order={order}
      />

      {/* Return & Replacement Request Modal */}
      <Modal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        title="Request Return or Replacement"
      >
        <form onSubmit={handleReturnSubmit} className="space-y-4 text-slate-900">
          <div>
            <label className="block text-xs font-bold mb-1">Request Type *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRequestType('RETURN')}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all ${
                  requestType === 'RETURN'
                    ? 'bg-purple-600 text-white border-purple-600 shadow'
                    : 'bg-white text-slate-700 border-slate-300'
                }`}
              >
                Return & Refund
              </button>
              <button
                type="button"
                onClick={() => setRequestType('REPLACEMENT')}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all ${
                  requestType === 'REPLACEMENT'
                    ? 'bg-purple-600 text-white border-purple-600 shadow'
                    : 'bg-white text-slate-700 border-slate-300'
                }`}
              >
                Item Replacement
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">Reason for Return/Replacement *</label>
            <select
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              className="w-full px-3 py-2 text-xs border rounded-xl bg-white"
            >
              <option value="Defective/Damaged Item">Defective or Damaged Item</option>
              <option value="Wrong Size/Variant Delivered">Wrong Size or Color Delivered</option>
              <option value="Quality Not as Expected">Product Quality Not as Expected</option>
              <option value="Missing Accessories">Missing Accessories or Components</option>
              <option value="Changed Mind">Changed Mind / No Longer Needed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">Additional Notes / Issue Description</label>
            <textarea
              rows="3"
              placeholder="Please describe the issue in detail..."
              value={returnDetails}
              onChange={(e) => setReturnDetails(e.target.value)}
              className="w-full px-3 py-2 text-xs border rounded-xl bg-white"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setReturnModalOpen(false)}
              className="px-4 py-2 text-xs font-bold bg-slate-100 text-slate-700 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingReturn}
              className="px-6 py-2 text-xs font-bold bg-purple-600 text-white rounded-xl shadow hover:bg-purple-700"
            >
              {submittingReturn ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default OrderDetails;
