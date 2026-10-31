import React, { useEffect, useState } from 'react';
import { ShieldAlert, Search, RefreshCw, Filter, Calendar, User, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');

  useEffect(() => {
    fetchAuditLogs();
  }, [page, resourceFilter]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/audit-logs', {
        params: {
          page,
          limit: 15,
          search,
          resource: resourceFilter,
        },
      });
      if (data.success) {
        setLogs(data.logs);
        setTotalPages(data.pages);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchAuditLogs();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-6 rounded-3xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <ShieldAlert className="text-amber-500" /> Admin Audit Logs
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            System audit trail capturing Who, What, When, Old Values, and New Values for administrative actions.
          </p>
        </div>

        <button
          onClick={fetchAuditLogs}
          className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl transition-colors flex items-center gap-2 text-xs font-semibold self-start sm:self-auto"
        >
          <RefreshCw size={16} /> Refresh Trail
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search email, action, product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 text-white placeholder-slate-500 text-xs rounded-xl py-2.5 pl-4 pr-10 border border-slate-800 focus:outline-none focus:border-purple-500"
          />
          <button type="submit" className="absolute right-3 top-2.5 text-slate-400">
            <Search size={16} />
          </button>
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
            <Filter size={14} /> Resource:
          </span>
          <select
            value={resourceFilter}
            onChange={(e) => {
              setResourceFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900 text-slate-200 border border-slate-800 text-xs rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="">All Resources</option>
            <option value="Product">Product Updates</option>
            <option value="Order">Order Statuses</option>
            <option value="User">User Accounts</option>
            <option value="Coupon">Coupons</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 font-medium">Loading audit logs...</div>
      ) : logs.length === 0 ? (
        <div className="p-12 text-center bg-slate-950 rounded-3xl border border-slate-800 text-slate-400">
          No audit log entries recorded yet.
        </div>
      ) : (
        <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Time</th>
                  <th className="py-3.5 px-4">Admin Email</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Resource / Entity</th>
                  <th className="py-3.5 px-4">Changes (Old vs New)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 text-slate-300">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-1.5">
                      <User size={14} className="text-purple-400" />
                      {log.adminEmail}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-purple-900/40 text-purple-300 border border-purple-800/40">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-200">
                      {log.resourceName || log.resource}
                      {log.resourceId && (
                        <span className="block text-[10px] text-slate-500 font-mono">ID: {log.resourceId}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1 font-mono text-[11px] bg-slate-900 p-2 rounded-xl border border-slate-800 max-w-xs">
                        {log.oldValue && (
                          <div className="text-rose-400 truncate">
                            <strong className="text-rose-500 font-sans text-[10px]">OLD:</strong>{' '}
                            {JSON.stringify(log.oldValue)}
                          </div>
                        )}
                        {log.newValue && (
                          <div className="text-emerald-400 truncate">
                            <strong className="text-emerald-500 font-sans text-[10px]">NEW:</strong>{' '}
                            {JSON.stringify(log.newValue)}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
