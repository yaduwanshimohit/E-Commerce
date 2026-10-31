import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Package,
  ShieldCheck,
  Zap,
  Tag,
  Grid,
  Bell,
  Scale,
  CheckCircle2,
} from 'lucide-react';
import { logout } from '../../redux/slices/authSlice';
import { fetchSearchSuggestions, clearSuggestions } from '../../redux/slices/productSlice';
import {
  fetchMyNotifications,
  markNotificationReadThunk,
  markAllNotificationsReadThunk,
} from '../../redux/slices/notificationSlice';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  const { wishlistItems } = useSelector((state) => state.wishlist);
  const { compareItems } = useSelector((state) => state.compare);
  const { notifications, unreadCount } = useSelector((state) => state.notifications);
  const { searchSuggestions } = useSelector((state) => state.products);
  const { categories } = useSelector((state) => state.categories);

  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Fetch notifications when logged in
  useEffect(() => {
    if (userInfo) {
      dispatch(fetchMyNotifications());
    }
  }, [dispatch, userInfo]);

  // Debounce search suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        dispatch(fetchSearchSuggestions(searchQuery.trim()));
        setShowSuggestions(true);
      } else {
        dispatch(clearSuggestions());
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, dispatch]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setCategoryDropdownOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    navigate('/');
    dispatch(logout());
    setUserDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900 text-white shadow-xl">
      {/* Top Banner Bar */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <Zap size={13} className="fill-amber-400 text-amber-400 animate-bounce" />
        <span>Use Coupon <strong className="bg-white/20 px-1.5 py-0.5 rounded text-amber-300">WELCOME100</strong> for Flat ₹100 OFF on your first order!</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4">
          
          {/* Mobile Hamburger & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <ShoppingBag size={22} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1">
                  Nex<span className="text-blue-400">Cart</span>
                </span>
                <span className="text-[9px] text-slate-400 font-semibold tracking-widest uppercase -mt-1">
                  Modern Store
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Search Bar with Auto-Complete */}
          <div ref={searchRef} className="hidden md:block flex-1 max-w-2xl relative">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                placeholder="Search products, brands, categories (e.g. Mobile, Samsung, Shoes)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim().length >= 2 && setShowSuggestions(true)}
                className="w-full bg-slate-800/90 text-white placeholder-slate-400 text-sm rounded-full py-2.5 pl-4 pr-12 border border-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center transition-colors"
                aria-label="Search"
              >
                <Search size={18} />
              </button>
            </form>

            {/* Debounced Search Suggestions Dropdown */}
            {showSuggestions && searchSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                {searchSuggestions.products?.length > 0 || searchSuggestions.categories?.length > 0 ? (
                  <div className="p-3 max-h-[380px] overflow-y-auto">
                    {searchSuggestions.categories?.length > 0 && (
                      <div className="mb-3">
                        <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider px-3 mb-1">
                          Categories
                        </div>
                        {searchSuggestions.categories.map((cat) => (
                          <Link
                            key={cat._id}
                            to={`/products?category=${encodeURIComponent(cat.name)}`}
                            onClick={() => setShowSuggestions(false)}
                            className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 rounded-xl transition-colors text-sm font-medium text-slate-700"
                          >
                            <Grid size={16} className="text-blue-600" />
                            {cat.name}
                          </Link>
                        ))}
                      </div>
                    )}

                    {searchSuggestions.products?.length > 0 && (
                      <div>
                        <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider px-3 mb-1">
                          Products
                        </div>
                        {searchSuggestions.products.map((prod) => (
                          <Link
                            key={prod._id}
                            to={`/products/${prod.slug || prod._id}`}
                            onClick={() => setShowSuggestions(false)}
                            className="flex items-center gap-3 px-3 py-2 hover:bg-slate-100 rounded-xl transition-colors"
                          >
                            <img
                              src={prod.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                              alt={prod.name}
                              className="w-10 h-10 object-contain rounded bg-slate-50 p-1"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-900 truncate">{prod.name}</p>
                              <p className="text-xs text-blue-600 font-bold">₹{prod.discountPrice?.toLocaleString('en-IN')}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-slate-500">
                    No matching products found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Right Navigation Action Links */}
          <div className="hidden lg:flex items-center gap-6">
            
            {/* Categories Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="flex items-center gap-1 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Categories <ChevronDown size={16} />
              </button>
              {categoryDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 py-2 z-50">
                  <Link
                    to="/categories"
                    onClick={() => setCategoryDropdownOpen(false)}
                    className="block px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 border-b border-slate-100"
                  >
                    All Categories →
                  </Link>
                  {categories?.map((cat) => (
                    <Link
                      key={cat._id}
                      to={`/products?category=${encodeURIComponent(cat.name)}`}
                      onClick={() => setCategoryDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link to="/orders" className="text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5">
              <Package size={18} />
              <span>My Orders</span>
            </Link>

            {/* Compare Link */}
            <Link to="/compare" className="relative p-2 text-slate-300 hover:text-white transition-colors" title="Compare Products">
              <Scale size={20} />
              {compareItems.length > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
                  {compareItems.length}
                </span>
              )}
            </Link>

            {/* Wishlist Link */}
            <Link to="/wishlist" className="relative p-2 text-slate-300 hover:text-white transition-colors" title="Wishlist">
              <Heart size={22} />
              {wishlistItems.length > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-rose-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-md">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* In-App Notification Bell & Dropdown */}
            {userInfo && (
              <div ref={notifRef} className="relative">
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="relative p-2 text-slate-300 hover:text-white transition-colors"
                  aria-label="Notifications"
                >
                  <Bell size={22} />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-amber-500 text-slate-950 text-[11px] font-extrabold rounded-full flex items-center justify-center shadow-md animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 overflow-hidden">
                    <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                      <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                        <Bell size={16} className="text-amber-500" /> Notifications
                      </h4>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => dispatch(markAllNotificationsReadThunk())}
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <CheckCircle2 size={12} /> Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            onClick={() => {
                              if (!n.isRead) dispatch(markNotificationReadThunk(n._id));
                              if (n.link) navigate(n.link);
                              setNotifDropdownOpen(false);
                            }}
                            className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                              !n.isRead ? 'bg-amber-50/40' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-bold text-slate-900">{n.title}</span>
                              <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1 leading-snug">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cart Link */}
            <Link to="/cart" className="relative flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-md hover:shadow-blue-500/20 transition-all">
              <ShoppingBag size={18} />
              <span>Cart</span>
              {totalCartCount > 0 && (
                <span className="ml-1 bg-white text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {totalCartCount}
                </span>
              )}
            </Link>

            {/* Auth / Account Dropdown */}
            <div ref={dropdownRef} className="relative">
              {userInfo ? (
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 text-sm font-semibold text-slate-200 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-colors"
                >
                  <img
                    src={userInfo.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                    alt={userInfo.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-blue-500"
                  />
                  <span className="max-w-[100px] truncate">{userInfo.name}</span>
                  <ChevronDown size={14} />
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 border border-slate-700 hover:border-slate-500 text-slate-200 px-4 py-2 rounded-full text-sm font-semibold transition-all"
                >
                  <User size={18} /> Login
                </Link>
              )}

              {/* Account Dropdown Menu */}
              {userDropdownOpen && userInfo && (
                <div className="absolute right-0 mt-2 w-56 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-900">{userInfo.name}</p>
                    <p className="text-xs text-slate-500 truncate">{userInfo.email}</p>
                    <span className="mt-1 inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                      {userInfo.role} Account
                    </span>
                  </div>

                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                  >
                    <User size={16} /> My Profile
                  </Link>

                  <Link
                    to="/orders"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                  >
                    <Package size={16} /> My Orders
                  </Link>

                  <Link
                    to="/addresses"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                  >
                    <Tag size={16} /> Manage Addresses
                  </Link>

                  {userInfo.role === 'ADMIN' && (
                    <Link
                      to="/admin/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
                    >
                      <ShieldCheck size={16} /> Admin Panel
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors mt-1 border-t border-slate-100"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Mobile Right Action Icons */}
          <div className="flex lg:hidden items-center gap-3">
            <Link to="/cart" className="relative p-2 text-slate-200">
              <ShoppingBag size={24} />
              {totalCartCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-blue-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
            </Link>
            {userInfo ? (
              <Link to="/profile" className="p-1">
                <img
                  src={userInfo.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover border-2 border-blue-500"
                />
              </Link>
            ) : (
              <Link to="/login" className="p-2 text-slate-200">
                <User size={24} />
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 text-white placeholder-slate-400 text-sm rounded-full py-2 pl-4 pr-10 border border-slate-700 focus:outline-none"
            />
            <button type="submit" className="absolute right-3 top-2 text-slate-400">
              <Search size={18} />
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Drawer Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex">
          <div className="w-4/5 max-w-sm bg-slate-900 text-white h-full p-6 overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between pb-6 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <ShoppingBag size={18} />
                </div>
                <span className="font-extrabold text-lg">NexCart</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            {userInfo ? (
              <div className="py-4 border-b border-slate-800 flex items-center gap-3">
                <img
                  src={userInfo.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                  alt={userInfo.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-bold text-sm">{userInfo.name}</p>
                  <p className="text-xs text-slate-400">{userInfo.email}</p>
                </div>
              </div>
            ) : (
              <div className="py-4 border-b border-slate-800 flex gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 bg-blue-600 text-white font-semibold text-sm rounded-xl"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm rounded-xl"
                >
                  Register
                </Link>
              </div>
            )}

            <div className="py-4 space-y-3 flex-1">
              <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium hover:text-blue-400">
                All Products
              </Link>
              <Link to="/categories" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium hover:text-blue-400">
                Categories
              </Link>
              <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium hover:text-blue-400">
                My Orders
              </Link>
              <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium hover:text-blue-400">
                Wishlist ({wishlistItems.length})
              </Link>
              <Link to="/cart" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium hover:text-blue-400">
                Shopping Cart ({totalCartCount})
              </Link>
              {userInfo && (
                <Link to="/addresses" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium hover:text-blue-400">
                  Manage Addresses
                </Link>
              )}
              {userInfo?.role === 'ADMIN' && (
                <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-purple-400">
                  Admin Dashboard
                </Link>
              )}
            </div>

            {userInfo && (
              <button
                onClick={handleLogout}
                className="w-full py-2.5 bg-rose-900/50 text-rose-300 font-semibold text-sm rounded-xl flex items-center justify-center gap-2 mt-auto"
              >
                <LogOut size={16} /> Logout
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
