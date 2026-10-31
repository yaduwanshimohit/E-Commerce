import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Public Pages
import Home from '../pages/Home';
import Products from '../pages/Products';
import ProductDetails from '../pages/ProductDetails';
import Categories from '../pages/Categories';
import SearchResults from '../pages/SearchResults';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import Cart from '../pages/Cart';
import Wishlist from '../pages/Wishlist';
import Checkout from '../pages/Checkout';
import OrderSuccess from '../pages/OrderSuccess';
import OrderFailed from '../pages/OrderFailed';
import MyOrders from '../pages/MyOrders';
import OrderDetails from '../pages/OrderDetails';
import UserProfile from '../pages/UserProfile';
import AddressManagement from '../pages/AddressManagement';
import AboutUs from '../pages/AboutUs';
import ContactUs from '../pages/ContactUs';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import TermsConditions from '../pages/TermsConditions';
import ReturnRefundPolicy from '../pages/ReturnRefundPolicy';
import Compare from '../pages/Compare';

// Admin Pages & Layout
import AdminLogin from '../admin/AdminLogin';
import AdminLayout from '../admin/AdminLayout';
import Dashboard from '../admin/Dashboard';
import AdminProducts from '../admin/Products';
import AdminCategories from '../admin/Categories';
import AdminOrders from '../admin/Orders';
import AdminUsers from '../admin/Users';
import AdminCoupons from '../admin/Coupons';
import AdminInventory from '../admin/Inventory';
import AdminQA from '../admin/QA';
import AdminAuditLogs from '../admin/AuditLogs';
import AdminBanners from '../admin/Banners';
import AdminReports from '../admin/Reports';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:idOrSlug" element={<ProductDetails />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/compare" element={<Compare />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/order-success/:orderId" element={<OrderSuccess />} />
      <Route path="/order-failed/:orderId" element={<OrderFailed />} />
      <Route path="/orders" element={<MyOrders />} />
      <Route path="/orders/:id" element={<OrderDetails />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/addresses" element={<AddressManagement />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-conditions" element={<TermsConditions />} />
      <Route path="/return-policy" element={<ReturnRefundPolicy />} />

      {/* Admin Login */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin Layout Wrapped Pages */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="qa" element={<AdminQA />} />
        <Route path="audit-logs" element={<AdminAuditLogs />} />
        <Route path="banners" element={<AdminBanners />} />
        <Route path="reports" element={<AdminReports />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
