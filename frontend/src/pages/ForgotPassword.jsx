import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, KeyRound, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email, newPassword });
      if (data.success) {
        toast.success(data.message);
        if (step === 1) setStep(2);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password reset request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-md">
            <KeyRound size={24} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Reset Account Password</h2>
          <p className="text-xs text-slate-500">Enter your registered email address to set a new password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Registered Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="email"
                required
                placeholder="user@nexcart.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-600 bg-slate-50"
              />
            </div>
          </div>

          {step === 2 && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Enter New Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  minlength="6"
                  placeholder="New password (at least 6 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-600 bg-slate-50"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
          >
            {loading ? 'Processing...' : step === 1 ? 'Send Reset Request' : 'Update Password'}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-slate-100">
          <Link to="/login" className="text-xs font-bold text-blue-600 flex items-center justify-center gap-1">
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
