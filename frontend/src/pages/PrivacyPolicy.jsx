import React from 'react';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-slate-700 text-sm leading-relaxed">
      <Breadcrumb items={[{ label: 'Privacy Policy' }]} />
      <h1 className="text-2xl font-extrabold text-slate-900">Privacy Policy</h1>
      <p>At NexCart, accessible from nexcart.com, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by NexCart and how we use it.</p>
      <h3 className="font-bold text-slate-900 text-base mt-4">Information We Collect</h3>
      <p>We collect information you provide directly to us when registering an account, placing an order, or communicating with us. This includes your name, email address, phone number, delivery address, and payment information handled securely via Razorpay.</p>
      <h3 className="font-bold text-slate-900 text-base mt-4">Data Security & Razorpay Integration</h3>
      <p>We do not store your raw credit card numbers or UPI PINs. All payment transactions are encrypted and processed through PCI-DSS compliant Razorpay gateways.</p>
    </div>
  );
};

export default PrivacyPolicy;
