import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Users, Shield, Ban, CheckCircle } from 'lucide-react';
import Loader from '../components/Loader/Loader';
import { fetchAdminUsers, toggleBlockUserThunk } from '../redux/slices/adminSlice';

const AdminUsers = () => {
  const dispatch = useDispatch();
  const { adminUsers: users, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAdminUsers());
  }, [dispatch]);

  const handleToggleBlock = (userId) => {
    dispatch(toggleBlockUserThunk(userId));
  };

  if (loading) return <Loader message="Loading registered users..." />;

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Users className="text-purple-400" /> User Management
        </h1>
        <p className="text-xs text-slate-400 mt-1">Manage registered customer accounts & security block status</p>
      </div>

      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-slate-400 uppercase font-bold border-b border-slate-800">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Email</th>
                <th className="p-4">Mobile</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-900/50">
                  <td className="p-4 flex items-center gap-3">
                    <img src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'} alt={u.name} className="w-8 h-8 rounded-full object-cover border border-slate-700" />
                    <span className="font-bold text-white">{u.name}</span>
                  </td>
                  <td className="p-4 text-slate-300">{u.email}</td>
                  <td className="p-4 text-slate-300">{u.mobile}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${u.role === 'ADMIN' ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'bg-slate-800 text-slate-300'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    {u.isBlocked ? (
                      <span className="px-2.5 py-1 bg-rose-950 text-rose-400 text-[10px] font-extrabold rounded-full flex items-center gap-1 w-max">
                        <Ban size={12} /> BLOCKED
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 text-[10px] font-extrabold rounded-full flex items-center gap-1 w-max">
                        <CheckCircle size={12} /> ACTIVE
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {u.role !== 'ADMIN' && (
                      <button
                        onClick={() => handleToggleBlock(u._id)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                          u.isBlocked
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800/40'
                        }`}
                      >
                        {u.isBlocked ? 'Unblock User' : 'Block User'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
