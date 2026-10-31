import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  IndianRupee,
  ShoppingBag,
  Users,
  Package,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import Loader from '../components/Loader/Loader';
import { fetchDashboardStats } from '../redux/slices/adminSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { dashboardStats, monthlySales, lowStockProducts, recentOrders, loading } = useSelector(
    (state) => state.admin
  );

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (loading) return <Loader message="Loading Admin Analytics..." />;

  const stats = dashboardStats || {
    totalSales: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    pendingOrders: 0,
    completedOrders: 0,
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">Admin Dashboard</h1>
        <p className="text-xs text-slate-400 mt-1">Real-time store performance analytics and sales insights</p>
      </div>

      {/* Top 6 Metrics Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        
        <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <IndianRupee size={20} />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Sales</span>
          <h3 className="text-xl font-black text-white">₹{stats.totalSales?.toLocaleString('en-IN')}</h3>
        </div>

        <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <ShoppingBag size={20} />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Orders</span>
          <h3 className="text-xl font-black text-white">{stats.totalOrders}</h3>
        </div>

        <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
            <Users size={20} />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Users</span>
          <h3 className="text-xl font-black text-white">{stats.totalUsers}</h3>
        </div>

        <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Package size={20} />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Products</span>
          <h3 className="text-xl font-black text-white">{stats.totalProducts}</h3>
        </div>

        <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Clock size={20} />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending Orders</span>
          <h3 className="text-xl font-black text-white">{stats.pendingOrders}</h3>
        </div>

        <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Completed Orders</span>
          <h3 className="text-xl font-black text-white">{stats.completedOrders}</h3>
        </div>

      </div>

      {/* Sales Revenue Chart Section */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <TrendingUp size={18} className="text-purple-400" /> Revenue & Sales Trends
          </h3>
          <span className="text-xs text-slate-400 font-medium">Monthly Breakdown</span>
        </div>

        <div className="h-72 w-full pt-4">
          {monthlySales?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySales}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9333ea" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs italic">
              No sales data recorded yet. Place orders to populate real-time analytics.
            </div>
          )}
        </div>
      </div>

      {/* Grid: Low Stock Alert & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Low Stock Alert */}
        <div className="lg:col-span-5 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-sm text-amber-400 flex items-center gap-2">
              <AlertTriangle size={16} /> Low Stock Inventory Alert
            </h3>
            <Link to="/admin/inventory" className="text-xs font-bold text-purple-400 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {lowStockProducts?.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">All product inventory is well-stocked!</p>
            ) : (
              lowStockProducts?.map((prod) => (
                <div key={prod._id} className="flex items-center justify-between p-3 bg-slate-900 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={prod.images?.[0]} alt={prod.name} className="w-10 h-10 object-contain bg-slate-950 rounded p-1" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{prod.name}</p>
                      <p className="text-[11px] text-slate-400">₹{prod.price?.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 text-xs font-extrabold rounded-lg">
                    {prod.stock} left
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent 5 Orders Table */}
        <div className="lg:col-span-7 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <ShoppingBag size={16} className="text-purple-400" /> Recent Customer Orders
            </h3>
            <Link to="/admin/orders" className="text-xs font-bold text-purple-400 hover:underline">
              Manage All Orders →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-slate-400 border-b border-slate-800 uppercase">
                <tr>
                  <th className="pb-2">Order ID</th>
                  <th className="pb-2">Customer</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {recentOrders?.map((ord) => (
                  <tr key={ord._id} className="hover:bg-slate-900/50">
                    <td className="py-3 font-mono font-bold text-purple-300">#{ord._id.slice(-6)}</td>
                    <td className="py-3 font-semibold text-white">{ord.user?.name || 'Customer'}</td>
                    <td className="py-3 font-bold text-white">₹{ord.totalAmount?.toLocaleString('en-IN')}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 text-[10px] font-extrabold uppercase">
                        {ord.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
