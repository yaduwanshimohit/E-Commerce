import React from 'react';
import { Printer, ShieldCheck, Download, X } from 'lucide-react';
import Modal from '../Modal/Modal';

const TaxInvoiceModal = ({ isOpen, onClose, order }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const gstRate = order.gstRate || 18;
  const taxableAmount = order.taxableAmount || Math.round((order.subtotal - order.discountAmount) / (1 + gstRate / 100));
  const taxAmount = order.taxAmount || Math.round((order.subtotal - order.discountAmount) - taxableAmount);
  const cgst = order.cgstAmount || Math.round(taxAmount / 2);
  const sgst = order.sgstAmount || (taxAmount - cgst);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tax Invoice (GST Compliant)">
      <div className="space-y-6 text-slate-800 text-xs p-2">
        
        {/* Actions Bar */}
        <div className="flex items-center justify-between bg-slate-100 p-3 rounded-2xl no-print">
          <div className="flex items-center gap-2 text-slate-700 font-bold">
            <ShieldCheck size={18} className="text-emerald-600" />
            <span>Official GST Tax Invoice</span>
          </div>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
          >
            <Printer size={15} /> Print / Download PDF
          </button>
        </div>

        {/* Invoice Printable Sheet */}
        <div className="bg-white p-6 rounded-2xl border border-slate-300 space-y-6 text-slate-900 font-sans printable-invoice">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-300 pb-4">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-blue-700">NexCart India Pvt Ltd</h2>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Premier E-Commerce Destination</p>
              <p className="text-[11px] text-slate-600 mt-1">Plot 42, Tech Park Sector 62, Noida, UP - 201301</p>
              <p className="text-[11px] text-slate-600"><strong>GSTIN:</strong> 09AAAAN1234F1Z9 | <strong>PAN:</strong> AAAAN1234F</p>
            </div>
            <div className="text-right">
              <span className="inline-block bg-slate-900 text-white font-black px-3 py-1 text-xs uppercase tracking-widest rounded-lg">
                TAX INVOICE
              </span>
              <p className="text-xs font-extrabold text-slate-900 mt-2">Invoice No: <span className="font-mono text-blue-700">{order.invoiceNumber || `INV-${order._id?.substring(0, 8).toUpperCase()}`}</span></p>
              <p className="text-[11px] text-slate-600">Date: {new Date(order.invoiceDate || order.createdAt).toLocaleDateString('en-IN')}</p>
              <p className="text-[11px] text-slate-600">Place of Supply: <strong>{order.shippingAddress?.state || 'State'}</strong></p>
            </div>
          </div>

          {/* Customer & Shipping Information */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-[11px]">
            <div>
              <h4 className="font-extrabold uppercase text-slate-500 mb-1 tracking-wider text-[10px]">Billed To & Shipped To:</h4>
              <p className="font-bold text-sm text-slate-900">{order.shippingAddress?.fullName}</p>
              <p className="text-slate-700">{order.shippingAddress?.houseFlat}, {order.shippingAddress?.street}</p>
              <p className="text-slate-700">{order.shippingAddress?.area}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
              <p className="text-slate-700 font-semibold mt-1">Mobile: +91 {order.shippingAddress?.mobileNumber}</p>
            </div>
            <div className="border-l border-slate-200 pl-6 space-y-1">
              <h4 className="font-extrabold uppercase text-slate-500 mb-1 tracking-wider text-[10px]">Order & Payment Details:</h4>
              <p>Order ID: <strong className="font-mono">{order._id}</strong></p>
              <p>Payment Method: <strong>{order.paymentMethod}</strong> ({order.paymentStatus})</p>
              <p>Courier Partner: <strong>{order.courierPartner || 'Delhivery Express'}</strong></p>
              <p>AWB Tracking No: <strong className="font-mono">{order.trackingNumber || 'N/A'}</strong></p>
            </div>
          </div>

          {/* Item Table with HSN & GST Breakdown */}
          <table className="w-full text-xs text-left border-collapse border border-slate-300">
            <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-300 text-[11px]">
              <tr>
                <th className="p-2.5 border-r border-slate-300 w-10 text-center">#</th>
                <th className="p-2.5 border-r border-slate-300">Item Description</th>
                <th className="p-2.5 border-r border-slate-300 w-20 text-center">HSN/SAC</th>
                <th className="p-2.5 border-r border-slate-300 w-12 text-center">Qty</th>
                <th className="p-2.5 border-r border-slate-300 w-20 text-right">Rate (₹)</th>
                <th className="p-2.5 border-r border-slate-300 w-24 text-right">Taxable (₹)</th>
                <th className="p-2.5 border-r border-slate-300 w-20 text-right">GST ({gstRate}%)</th>
                <th className="p-2.5 text-right w-24">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-[11px]">
              {order.orderItems?.map((item, idx) => {
                const itemTotal = item.price * item.quantity;
                const itemTaxable = Math.round(itemTotal / (1 + gstRate / 100));
                const itemGst = itemTotal - itemTaxable;

                return (
                  <tr key={idx}>
                    <td className="p-2.5 border-r border-slate-300 text-center font-bold text-slate-500">{idx + 1}</td>
                    <td className="p-2.5 border-r border-slate-300">
                      <p className="font-bold text-slate-900">{item.name}</p>
                      {item.variantInfo && <p className="text-[10px] text-purple-700 font-semibold">{item.variantInfo}</p>}
                      {item.sku && <p className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</p>}
                    </td>
                    <td className="p-2.5 border-r border-slate-300 text-center font-mono">{item.hsnCode || '8517'}</td>
                    <td className="p-2.5 border-r border-slate-300 text-center font-bold">{item.quantity}</td>
                    <td className="p-2.5 border-r border-slate-300 text-right font-mono">₹{item.price?.toLocaleString('en-IN')}</td>
                    <td className="p-2.5 border-r border-slate-300 text-right font-mono">₹{itemTaxable.toLocaleString('en-IN')}</td>
                    <td className="p-2.5 border-r border-slate-300 text-right font-mono">₹{itemGst.toLocaleString('en-IN')}</td>
                    <td className="p-2.5 text-right font-extrabold font-mono">₹{itemTotal.toLocaleString('en-IN')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Tax Breakdown & Grand Total */}
          <div className="flex justify-end pt-2">
            <div className="w-72 space-y-2 text-xs border border-slate-300 p-3 rounded-xl bg-slate-50">
              <div className="flex justify-between text-slate-600">
                <span>Taxable Amount</span>
                <span className="font-mono font-bold text-slate-900">₹{taxableAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>CGST (9%)</span>
                <span className="font-mono font-bold text-slate-900">₹{cgst.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>SGST (9%)</span>
                <span className="font-mono font-bold text-slate-900">₹{sgst.toLocaleString('en-IN')}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount</span>
                  <span className="font-mono">- ₹{order.discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charges</span>
                <span className="font-mono font-bold text-slate-900">{order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-300 font-black text-sm text-slate-900">
                <span>Grand Total</span>
                <span className="font-mono text-blue-700">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 italic">
            <p>This is a computer-generated GST tax invoice. No signature required.</p>
            <p>Thank you for shopping with NexCart India!</p>
          </div>

        </div>

      </div>
    </Modal>
  );
};

export default TaxInvoiceModal;
