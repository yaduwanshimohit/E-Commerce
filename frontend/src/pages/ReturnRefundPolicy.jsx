import React from 'react';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';

const ReturnRefundPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-slate-700 text-sm leading-relaxed">
      <Breadcrumb items={[{ label: 'Return & Refund Policy' }]} />
      <h1 className="text-2xl font-extrabold text-slate-900">7 Days Easy Return & Refund Policy</h1>
      <p>We want you to be completely satisfied with your purchase on NexCart. If you receive a damaged, defective, or incorrect product, you can request a return within 7 days of delivery.</p>
      <h3 className="font-bold text-slate-900 text-base mt-4">Refund Process</h3>
      <p>Once your returned product is inspected and verified, your refund will be processed to your original payment mode (Razorpay / UPI / Bank Account) within 3-5 business days.</p>
    </div>
  );
};

export default ReturnRefundPolicy;
