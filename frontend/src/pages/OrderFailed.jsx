import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { XCircle, RefreshCw, HelpCircle } from 'lucide-react';

const OrderFailed = () => {
  const { orderId } = useParams();

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="w-24 h-24 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
        <XCircle size={56} />
      </div>

      <span className="inline-block px-3 py-1 bg-rose-100 text-rose-800 font-bold text-xs rounded-full uppercase tracking-wider mb-2">
        PAYMENT FAILED
      </span>

      <h1 className="text-3xl font-black text-slate-900 mb-2">Payment Verification Failed</h1>
      <p className="text-sm text-slate-600 max-w-md mx-auto mb-8">
        We couldn't verify your online payment for order <strong>#{orderId?.slice(-8)}</strong>. Don't worry, if any amount was debited, it will be automatically refunded to your bank account within 3-5 business days.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/checkout"
          className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-lg flex items-center gap-2"
        >
          <RefreshCw size={18} /> Retry Payment
        </Link>
        <Link
          to="/contact"
          className="px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-2xl flex items-center gap-2"
        >
          <HelpCircle size={18} /> Contact Support
        </Link>
      </div>
    </div>
  );
};

export default OrderFailed;
