import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShieldCheck, Mail, Lock, ArrowRight } from 'lucide-react';
import { adminLogin } from '../redux/slices/authSlice';

const AdminLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userInfo, loading } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('admin@nexcart.com');
  const [password, setPassword] = useState('admin123');

  useEffect(() => {
    if (userInfo && userInfo.role === 'ADMIN') {
      navigate('/admin/dashboard');
    }
  }, [userInfo, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      dispatch(adminLogin({ email, password }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 w-full max-w-md p-8 rounded-3xl border border-slate-800 shadow-2xl text-white space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-purple-600/30">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-black tracking-tight">NexCart Admin Portal</h2>
          <p className="text-xs text-slate-400">Control center for orders, products & store analytics</p>
        </div>

        <div className="p-3 bg-purple-950/60 rounded-2xl border border-purple-800/40 text-xs text-purple-200">
          <strong>Default Admin Credentials:</strong><br />
          Email: admin@nexcart.com | Password: admin123
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Admin Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-3 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            {loading ? 'Authenticating...' : 'Access Admin Dashboard'} <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
