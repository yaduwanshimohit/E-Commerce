import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, Truck, RotateCcw, Headphones, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800 mt-20">
      {/* Trust Badges Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 pb-12 border-b border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center flex-shrink-0">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Free Delivery</h4>
              <p className="text-xs text-slate-400">On all orders above ₹499</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">100% Secure Payments</h4>
              <p className="text-xs text-slate-400">Razorpay Encrypted & Verified</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center flex-shrink-0">
              <RotateCcw size={24} />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">7 Days Easy Return</h4>
              <p className="text-xs text-slate-400">No questions asked refund</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50">
            <div className="w-12 h-12 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Headphones size={24} />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">24/7 Customer Support</h4>
              <p className="text-xs text-slate-400">Dedicated help center</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Links Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
        <div className="lg:col-span-2">
          <Link to="/" className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <ShoppingBag size={20} className="text-white" />
            </div>
            <span className="text-2xl font-extrabold text-white">NexCart</span>
          </Link>
          <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">
            NexCart is India's leading digital shopping platform bringing millions of products from electronics to fashion straight to your doorstep with guaranteed fast delivery.
          </p>
          <p className="text-xs text-slate-500">
            Accepted Payments: Razorpay, UPI, Credit/Debit Cards, Net Banking, Cash on Delivery.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Popular Categories</h4>
          <ul className="space-y-2.5 text-sm text-slate-400">
            <li><Link to="/products?category=Mobiles" className="hover:text-blue-400 transition-colors">Mobiles & 5G Phones</Link></li>
            <li><Link to="/products?category=Electronics" className="hover:text-blue-400 transition-colors">Laptops & Smart TVs</Link></li>
            <li><Link to="/products?category=Fashion" className="hover:text-blue-400 transition-colors">Fashion & Sneakers</Link></li>
            <li><Link to="/products?category=Home%20%26%20Kitchen" className="hover:text-blue-400 transition-colors">Home & Kitchen</Link></li>
            <li><Link to="/products?category=Beauty" className="hover:text-blue-400 transition-colors">Beauty & Grooming</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Customer Care</h4>
          <ul className="space-y-2.5 text-sm text-slate-400">
            <li><Link to="/orders" className="hover:text-blue-400 transition-colors">Track Your Order</Link></li>
            <li><Link to="/contact" className="hover:text-blue-400 transition-colors">Help Center & Contact</Link></li>
            <li><Link to="/return-policy" className="hover:text-blue-400 transition-colors">Return & Refund Policy</Link></li>
            <li><Link to="/addresses" className="hover:text-blue-400 transition-colors">Shipping Info</Link></li>
            <li><Link to="/about" className="hover:text-blue-400 transition-colors">About NexCart</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Legal & Policies</h4>
          <ul className="space-y-2.5 text-sm text-slate-400">
            <li><Link to="/privacy-policy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms-conditions" className="hover:text-blue-400 transition-colors">Terms & Conditions</Link></li>
            <li><Link to="/admin/login" className="hover:text-purple-400 transition-colors font-medium">Admin Portal Login</Link></li>
          </ul>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>© 2026 NexCart India E-Commerce Platform. All rights reserved.</p>
        <p className="flex items-center gap-1">
          Built with <Heart size={14} className="text-rose-500 fill-rose-500" /> for Indian Shoppers.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
