const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Banner = require('../models/Banner');
const analyticsService = require('../services/analyticsService');

// @desc    Get Admin Dashboard Stats & Analytics
// @route   GET /api/admin/dashboard-stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments({ role: { $ne: 'ADMIN' } });
  const totalProducts = await Product.countDocuments({});
  const totalOrders = await Order.countDocuments({});
  const pendingOrders = await Order.countDocuments({ orderStatus: { $in: ['PLACED', 'CONFIRMED', 'PROCESSING'] } });
  const completedOrders = await Order.countDocuments({ orderStatus: 'DELIVERED' });

  // Compute advanced database metrics using AnalyticsService
  const analytics = await analyticsService.getDashboardAnalytics();

  // Low stock products alert
  const lowStockProducts = await Product.find({ stock: { $lte: 5 } }).select('name stock price images brand');

  // Recent 5 Orders
  const recentOrders = await Order.find({})
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(5);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedMonthlySales = analytics.monthlySales.map((item) => ({
    month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
    revenue: item.revenue,
    orders: item.orders,
  }));

  res.json({
    success: true,
    stats: {
      totalSales: analytics.totalRevenue,
      totalOrders: analytics.totalOrders,
      totalPaidOrders: analytics.totalPaidOrders,
      avgOrderValue: analytics.avgOrderValue,
      totalUsers,
      totalProducts,
      pendingOrders,
      completedOrders,
      conversionRate: analytics.conversionRate,
      repeatCustomerRatio: analytics.repeatCustomerRatio,
      refundRate: analytics.refundRate,
    },
    topProducts: analytics.topProducts,
    monthlySales: formattedMonthlySales,
    lowStockProducts,
    recentOrders,
  });
});

// @desc    Get Banners
// @route   GET /api/admin/banners
// @access  Public
const getBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find({ isActive: true }).sort({ createdAt: -1 });
  res.json({ success: true, banners });
});

// @desc    Create Banner (Admin)
// @route   POST /api/admin/banners
// @access  Private/Admin
const createBanner = asyncHandler(async (req, res) => {
  const { title, subtitle, image, linkUrl, buttonText, badgeText } = req.body;

  const banner = await Banner.create({
    title,
    subtitle: subtitle || '',
    image,
    linkUrl: linkUrl || '/products',
    buttonText: buttonText || 'Shop Now',
    badgeText: badgeText || 'PROMO',
    isActive: true,
  });

  res.status(201).json({ success: true, banner });
});

// @desc    Delete Banner (Admin)
// @route   DELETE /api/admin/banners/:id
// @access  Private/Admin
const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (banner) {
    await banner.deleteOne();
    res.json({ success: true, message: 'Banner deleted successfully' });
  } else {
    res.status(404);
    throw new Error('Banner not found');
  }
});

module.exports = {
  getDashboardStats,
  getBanners,
  createBanner,
  deleteBanner,
};
