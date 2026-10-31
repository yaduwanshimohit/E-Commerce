import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BarChart3, TrendingUp, IndianRupee, ShoppingBag, Download, Users, RefreshCw, Percent, ShieldCheck } from 'lucide-react';
import Loader from '../components/Loader/Loader';
import { fetchDashboardStats } from '../redux/slices/adminSlice';

const AdminReports = () => {
  const dispatch = useDispatch();
  const { dashboardStats, monthlySales, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const handleExportCSV = () => {
    if (!monthlySales || monthlySales.length === 0) return;
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Month,Revenue,Orders\n' +
      monthlySales.map((e) => `${e.month},${e.revenue},${e.orders}`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NexCart_Sales_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  if (loading) return <Loader message="Generating financial & business analytics report..." />;

  const stats = dashboardStats || { totalSales: 0, totalOrders: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <BarChart3 className="text-purple-400" /> Store Sales & Business Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real database analytics for Revenue, AOV, Conversion Rate, Repeat Customers & Refunds.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Download size={16} /> Export Financial CSV
        </button>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-2">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Total Revenue</span>
          <h2 className="text-2xl font-black text-white">₹{stats.totalSales?.toLocaleString('en-IN')}</h2>
          <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp size={12} /> Actual Paid Orders Revenue
          </p>
        </div>

        <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-2">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Average Order Value (AOV)</span>
          <h2 className="text-2xl font-black text-white">₹{stats.avgOrderValue?.toLocaleString('en-IN') || 0}</h2>
          <p className="text-[11px] text-purple-400 font-semibold">Average spend per paid checkout</p>
        </div>

        <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-2">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Conversion Rate</span>
          <h2 className="text-2xl font-black text-white">{stats.conversionRate || 0}%</h2>
          <p className="text-[11px] text-blue-400 font-semibold">Registered vs Ordering Users</p>
        </div>

        <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-2">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Repeat Customer Ratio</span>
          <h2 className="text-2xl font-black text-white">{stats.repeatCustomerRatio || 0}%</h2>
          <p className="text-[11px] text-amber-400 font-semibold">Customers with &gt;1 order</p>
        </div>
      </div>

      {/* Monthly Financial Breakdown */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 space-y-4">
        <h3 className="font-bold text-base text-white">Monthly Financial Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-slate-400 uppercase font-bold border-b border-slate-800">
              <tr>
                <th className="p-4">Period / Month</th>
                <th className="p-4">Completed Orders</th>
                <th className="p-4">Gross Sales Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {monthlySales?.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-900/50">
                  <td className="p-4 font-bold text-white">{row.month}</td>
                  <td className="p-4 text-slate-300">{row.orders} orders</td>
                  <td className="p-4 font-black text-emerald-400">₹{row.revenue?.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
