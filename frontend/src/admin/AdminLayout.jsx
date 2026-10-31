import React from 'react';
import { Link, useLocation, useNavigate, Outlet, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tag,
  Image,
  BarChart3,
  LogOut,
  ShieldCheck,
  Grid,
  AlertTriangle,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';
import { logout } from '../redux/slices/authSlice';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.auth);

  if (!userInfo || userInfo.role !== 'ADMIN') {
    return <Navigate to="/admin/login" replace />;
  }

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { label: 'Products', icon: Package, path: '/admin/products' },
    { label: 'Categories', icon: Grid, path: '/admin/categories' },
    { label: 'Orders', icon: ShoppingBag, path: '/admin/orders' },
    { label: 'Users', icon: Users, path: '/admin/users' },
    { label: 'Coupons', icon: Tag, path: '/admin/coupons' },
    { label: 'Inventory', icon: AlertTriangle, path: '/admin/inventory' },
    { label: 'Product Q&A', icon: HelpCircle, path: '/admin/qa' },
    { label: 'Audit Logs', icon: ShieldAlert, path: '/admin/audit-logs' },
    { label: 'Banners', icon: Image, path: '/admin/banners' },
    { label: 'Sales Reports', icon: BarChart3, path: '/admin/reports' },
  ];

  const handleLogout = () => {
    navigate('/');
    dispatch(logout());
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
      
      {/* Admin Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 flex-shrink-0 flex flex-col justify-between">
        <div>
          {/* Admin Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/30">
                <ShieldCheck size={20} className="text-white" />
              </div>
              <span className="font-black text-lg text-white">NexCart <span className="text-purple-400">Admin</span></span>
            </Link>
          </div>

          {/* Nav List */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Admin Footer & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-3 px-3 py-2 bg-slate-900 rounded-2xl">
            <img
              src={userInfo.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt="Admin"
              className="w-8 h-8 rounded-full object-cover border border-purple-500"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{userInfo.name}</p>
              <p className="text-[10px] text-purple-400">Administrator</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border border-rose-800/40"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Admin View Container */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <Outlet />
      </main>

    </div>
  );
};

export default AdminLayout;
