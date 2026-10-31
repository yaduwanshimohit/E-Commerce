import React from 'react';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';

const TermsConditions = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-slate-700 text-sm leading-relaxed">
      <Breadcrumb items={[{ label: 'Terms & Conditions' }]} />
      <h1 className="text-2xl font-extrabold text-slate-900">Terms & Conditions</h1>
      <p>Welcome to NexCart! These terms and conditions outline the rules and regulations for the use of NexCart's E-Commerce Platform.</p>
      <h3 className="font-bold text-slate-900 text-base mt-4">Orders & Pricing</h3>
      <p>All prices listed on NexCart are in Indian Rupees (INR ₹) inclusive of applicable taxes unless specified otherwise. We reserve the right to cancel orders in case of pricing errors or stock unavailability.</p>
    </div>
  );
};

export default TermsConditions;
