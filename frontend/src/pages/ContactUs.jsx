import React, { useState } from 'react';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const ContactUs = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Thank you! Your inquiry has been submitted to NexCart Support.');
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <Breadcrumb items={[{ label: 'Contact Us' }]} />

      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900">Contact Customer Support</h1>
        <p className="text-xs text-slate-500 mt-1">We're here to help you 24/7 with any order or payment questions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Phone size={20} />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold block">Toll-Free Helpline</span>
              <span className="font-bold text-sm text-slate-900">1800-123-9999</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Mail size={20} />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold block">Support Email</span>
              <span className="font-bold text-sm text-slate-900">support@nexcart.com</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <MapPin size={20} />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold block">Corporate Office</span>
              <span className="font-bold text-xs text-slate-900">NexCart Towers, Koramangala 5th Block, Bengaluru, KA 560095</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 mb-4">Send Us A Message</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-blue-600 outline-none bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Your Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-blue-600 outline-none bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Message</label>
              <textarea
                rows="4"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-blue-600 outline-none bg-slate-50"
              ></textarea>
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2"
            >
              <Send size={16} /> Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
