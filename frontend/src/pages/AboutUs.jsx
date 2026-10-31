import React from 'react';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import { ShoppingBag, ShieldCheck, Award, Heart, Users } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <Breadcrumb items={[{ label: 'About Us' }]} />

      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          ABOUT NEXCART
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          India's Premier Digital E-Commerce Platform
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Connecting millions of Indian buyers with authentic top-quality electronics, fashion, beauty, home appliances, and daily essentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Award size={24} />
          </div>
          <h3 className="font-bold text-slate-900 text-base">100% Genuine Products</h3>
          <p className="text-xs text-slate-500 leading-relaxed">Direct brand warranty on all electronics, smartphones, and home appliances.</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <ShieldCheck size={24} />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Secure Payments</h3>
          <p className="text-xs text-slate-500 leading-relaxed">Razorpay encrypted checkout supporting UPI, Credit Cards, Net Banking & COD.</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <Users size={24} />
          </div>
          <h3 className="font-bold text-slate-900 text-base">2M+ Happy Customers</h3>
          <p className="text-xs text-slate-500 leading-relaxed">Fast express shipping across 19,000+ pincodes in India.</p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
