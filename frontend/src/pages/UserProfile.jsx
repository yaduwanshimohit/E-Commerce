import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { User, Mail, Phone, Lock, Camera, ShieldCheck, Check } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import { updateProfile } from '../redux/slices/authSlice';

const UserProfile = () => {
  const dispatch = useDispatch();
  const { userInfo, loading } = useSelector((state) => state.auth);

  const [name, setName] = useState(userInfo?.name || '');
  const [mobile, setMobile] = useState(userInfo?.mobile || '');
  const [avatar, setAvatar] = useState(userInfo?.avatar || '');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const updateData = { name, mobile, avatar };
    if (password) updateData.password = password;
    dispatch(updateProfile(updateData));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <Breadcrumb items={[{ label: 'User Profile' }]} />

      <h1 className="text-2xl font-extrabold text-slate-900">My Profile Details</h1>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Avatar Sidebar */}
        <div className="md:col-span-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0">
          <div className="relative mb-4">
            <img
              src={avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'}
              alt={name}
              className="w-28 h-28 rounded-full object-cover border-4 border-blue-600 shadow-lg"
            />
          </div>
          <h3 className="font-extrabold text-slate-900 text-lg">{userInfo?.name}</h3>
          <p className="text-xs text-slate-500">{userInfo?.email}</p>
          <span className="mt-2 text-[10px] font-bold uppercase tracking-wider px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
            {userInfo?.role} Member
          </span>
        </div>

        {/* Profile Update Form */}
        <div className="md:col-span-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-600 bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address (Read-Only)</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="email"
                  disabled
                  value={userInfo?.email || ''}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-100 text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-600 bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Avatar Image URL</label>
              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-600 bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">New Password (Leave blank to keep unchanged)</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-600 bg-slate-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-98"
            >
              <Check size={16} /> {loading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default UserProfile;
