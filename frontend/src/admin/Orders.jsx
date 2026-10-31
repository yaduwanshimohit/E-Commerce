import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingBag, Truck, RotateCcw, FileText, CheckCircle2, XCircle, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import Loader from '../components/Loader/Loader';
import Modal from '../components/Modal/Modal';
import TaxInvoiceModal from '../components/Invoice/TaxInvoiceModal';
import { fetchAdminOrders } from '../redux/slices/adminSlice';
import api from '../services/api';

const orderStatuses = [
  'PLACED',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
];

const returnStatuses = [
  'NONE',
  'RETURN_REQUESTED',
  'REPLACEMENT_REQUESTED',
  'APPROVED',
  'REJECTED',
  'PICKUP_SCHEDULED',
  'PICKED_UP',
  'RECEIVED',
  'COMPLETED',
];

const refundStatuses = [
  'NOT_APPLICABLE',
  'REQUESTED',
  'APPROVED',
  'PROCESSING',
  'REFUNDED',
  'REJECTED',
];

const AdminOrders = () => {
  const dispatch = useDispatch();
  const { adminOrders: orders, loading } = useSelector((state) => state.admin);

  // Selected Order for Modals
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [logisticsModalOpen, setLogisticsModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  // Logistics Form
  const [courierPartner, setCourierPartner] = useState('Delhivery Express');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shipmentStatus, setShipmentStatus] = useState('LABEL_CREATED');

  // Return & Refund Form
  const [returnStatus, setReturnStatus] = useState('APPROVED');
  const [adminNote, setAdminNote] = useState('');
  const [refundAmount, setRefundAmount] = useState(0);

  useEffect(() => {
    dispatch(fetchAdminOrders());
  }, [dispatch]);

  const handleStatusChange = async (orderId, updates) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, updates);
      toast.success('Order status updated!');
      dispatch(fetchAdminOrders());
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleOpenLogistics = (ord) => {
    setSelectedOrder(ord);
    setCourierPartner(ord.courierPartner || 'Delhivery Express');
    setTrackingNumber(ord.trackingNumber || '');
    setShipmentStatus(ord.shipmentStatus || 'LABEL_CREATED');
    setLogisticsModalOpen(true);
  };

  const handleSaveLogistics = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/orders/${selectedOrder._id}/logistics`, {
        courierPartner,
        trackingNumber,
        shipmentStatus,
      });
      toast.success('Logistics & AWB details updated successfully!');
      setLogisticsModalOpen(false);
      dispatch(fetchAdminOrders());
    } catch (err) {
      toast.error('Failed to update logistics');
    }
  };

  const handleOpenReturn = (ord) => {
    setSelectedOrder(ord);
    setReturnStatus(ord.returnStatus || 'APPROVED');
    setAdminNote(ord.adminDecisionNote || '');
    setRefundAmount(ord.refundAmount || ord.totalAmount);
    setReturnModalOpen(true);
  };

  const handleReturnDecision = async (decision) => {
    try {
      await api.put(`/admin/orders/${selectedOrder._id}/return-decision`, {
        decision,
        returnStatus,
        adminNote,
      });
      toast.success(`Return request ${decision === 'APPROVE' ? 'Approved' : 'Rejected'}`);
      setReturnModalOpen(false);
      dispatch(fetchAdminOrders());
    } catch (err) {
      toast.error('Failed to update return decision');
    }
  };

  const handleProcessRefund = async () => {
    try {
      await api.put(`/admin/orders/${selectedOrder._id}/process-refund`, {
        refundAmount,
        refundTransactionId: `RFD_RAZORPAY_${Date.now()}`,
      });
      toast.success('Refund processed & customer notified!');
      setReturnModalOpen(false);
      dispatch(fetchAdminOrders());
    } catch (err) {
      toast.error('Failed to process refund');
    }
  };

  if (loading) return <Loader message="Loading store orders..." />;

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <ShoppingBag className="text-purple-400" /> Order & Logistics Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage fulfillment, AWB tracking, GST invoices & return/refund workflows</p>
        </div>
      </div>

      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-slate-400 uppercase font-bold border-b border-slate-800">
              <tr>
                <th className="p-4">Order ID & Date</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Total</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Order Status</th>
                <th className="p-4">Logistics AWB</th>
                <th className="p-4">Return / Refund</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {orders.map((ord) => (
                <tr key={ord._id} className="hover:bg-slate-900/50">
                  <td className="p-4">
                    <p className="font-mono font-bold text-purple-300">#{ord._id}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-white">{ord.user?.name || 'Customer'}</p>
                    <p className="text-[11px] text-slate-400">{ord.shippingAddress?.city}, {ord.shippingAddress?.state}</p>
                  </td>
                  <td className="p-4 font-bold text-white">₹{ord.totalAmount?.toLocaleString('en-IN')}</td>
                  <td className="p-4">
                    <select
                      value={ord.paymentStatus}
                      onChange={(e) => handleStatusChange(ord._id, { paymentStatus: e.target.value })}
                      className="bg-slate-900 text-slate-200 font-bold text-[11px] px-2 py-1 rounded-lg border border-slate-700 cursor-pointer"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PAID">PAID</option>
                      <option value="FAILED">FAILED</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <select
                      value={ord.orderStatus}
                      onChange={(e) => handleStatusChange(ord._id, { orderStatus: e.target.value })}
                      className="bg-slate-900 text-white font-bold text-xs px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500 cursor-pointer"
                    >
                      {orderStatuses.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleOpenLogistics(ord)}
                      className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-purple-300 border border-slate-700 rounded-lg text-[11px] font-bold flex items-center gap-1"
                    >
                      <Truck size={13} /> {ord.trackingNumber ? ord.trackingNumber : 'Assign AWB'}
                    </button>
                  </td>
                  <td className="p-4">
                    {ord.returnStatus && ord.returnStatus !== 'NONE' ? (
                      <button
                        onClick={() => handleOpenReturn(ord)}
                        className="px-2.5 py-1 bg-purple-950 text-purple-300 border border-purple-800 rounded-lg text-[10px] font-extrabold flex items-center gap-1"
                      >
                        <RotateCcw size={12} /> {ord.returnStatus.replace(/_/g, ' ')}
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-500">None</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedOrder(ord);
                        setInvoiceModalOpen(true);
                      }}
                      className="p-1.5 text-blue-400 hover:bg-slate-900 rounded-lg"
                      title="View Tax Invoice"
                    >
                      <FileText size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Logistics Tracking Modal */}
      {selectedOrder && (
        <Modal
          isOpen={logisticsModalOpen}
          onClose={() => setLogisticsModalOpen(false)}
          title={`Logistics & AWB: Order #${selectedOrder._id}`}
        >
          <form onSubmit={handleSaveLogistics} className="space-y-4 text-slate-900">
            <div>
              <label className="block text-xs font-bold mb-1">Courier Partner *</label>
              <select
                value={courierPartner}
                onChange={(e) => setCourierPartner(e.target.value)}
                className="w-full px-3 py-2 text-xs border rounded-xl bg-white"
              >
                <option value="Delhivery Express">Delhivery Express</option>
                <option value="BlueDart Courier">BlueDart Courier</option>
                <option value="DTDC Express">DTDC Express</option>
                <option value="XpressBees">XpressBees</option>
                <option value="Ecom Express">Ecom Express</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">AWB Tracking Number *</label>
              <input
                type="text"
                required
                placeholder="e.g., AWB984729104"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs border rounded-xl bg-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Shipment Status *</label>
              <select
                value={shipmentStatus}
                onChange={(e) => setShipmentStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs border rounded-xl bg-white"
              >
                <option value="LABEL_CREATED">LABEL_CREATED (Packed)</option>
                <option value="PICKED_UP">PICKED_UP (In Courier Hub)</option>
                <option value="IN_TRANSIT">IN_TRANSIT (On the Way)</option>
                <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY (Out with Delivery Agent)</option>
                <option value="DELIVERED">DELIVERED (Handed Over)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setLogisticsModalOpen(false)}
                className="px-4 py-2 text-xs font-bold bg-slate-100 text-slate-700 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 text-xs font-bold bg-purple-600 text-white rounded-xl shadow hover:bg-purple-700"
              >
                Save Logistics Info
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Return & Refund Workflow Modal */}
      {selectedOrder && (
        <Modal
          isOpen={returnModalOpen}
          onClose={() => setReturnModalOpen(false)}
          title={`Return & Refund Decision: Order #${selectedOrder._id}`}
        >
          <div className="space-y-4 text-slate-900 text-xs">
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
              <p>Request Type: <strong className="text-purple-900 font-bold">{selectedOrder.requestType || 'RETURN'}</strong></p>
              <p>Reason: <strong className="text-slate-900">{selectedOrder.returnReason || 'Not Specified'}</strong></p>
              {selectedOrder.returnDetails && <p className="mt-1 text-slate-600">Notes: {selectedOrder.returnDetails}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Return Lifecycle Status</label>
              <select
                value={returnStatus}
                onChange={(e) => setReturnStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs border rounded-xl bg-white"
              >
                {returnStatuses.map((st) => (
                  <option key={st} value={st}>
                    {st.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Admin Decision Note for Customer</label>
              <textarea
                rows="2"
                placeholder="e.g. Return approved. Pickup scheduled for tomorrow."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="w-full px-3 py-2 text-xs border rounded-xl bg-white"
              ></textarea>
            </div>

            <div className="flex gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => handleReturnDecision('APPROVE')}
                className="flex-1 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow hover:bg-emerald-700"
              >
                Approve Request
              </button>
              <button
                type="button"
                onClick={() => handleReturnDecision('REJECT')}
                className="flex-1 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl shadow hover:bg-rose-700"
              >
                Reject Request
              </button>
            </div>

            {/* Refund Trigger Section */}
            <div className="pt-3 border-t space-y-2">
              <label className="block text-xs font-extrabold text-slate-800">Process Refund</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Refund Amount"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(Number(e.target.value))}
                  className="flex-1 px-3 py-2 text-xs border rounded-xl bg-white"
                />
                <button
                  type="button"
                  onClick={handleProcessRefund}
                  className="px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl shadow hover:bg-purple-700"
                >
                  ⚡ Initiate Refund
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Tax Invoice Modal */}
      {selectedOrder && (
        <TaxInvoiceModal
          isOpen={invoiceModalOpen}
          onClose={() => setInvoiceModalOpen(false)}
          order={selectedOrder}
        />
      )}

    </div>
  );
};

export default AdminOrders;
