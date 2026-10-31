const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

/**
 * Analytics Service
 * Computes production-grade business metrics from actual database collections.
 */
class AnalyticsService {
  async getDashboardAnalytics() {
    // 1. Overall Revenue & Orders
    const paidOrdersAggregation = await Order.aggregate([
      { $match: { isPaid: true } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' },
          totalPaidOrders: { $sum: 1 },
          avgOrderValue: { $avg: '$totalPrice' },
        },
      },
    ]);

    const totalRevenue = paidOrdersAggregation[0]?.totalRevenue || 0;
    const totalPaidOrders = paidOrdersAggregation[0]?.totalPaidOrders || 0;
    const avgOrderValue = Math.round(paidOrdersAggregation[0]?.avgOrderValue || 0);

    const totalOrdersCount = await Order.countDocuments({});

    // 2. Customer Insights & Repeat Customers
    const totalUsersCount = await User.countDocuments({ role: 'CUSTOMER' });
    const repeatCustomerAggregation = await Order.aggregate([
      { $group: { _id: '$user', orderCount: { $sum: 1 } } },
      { $match: { orderCount: { $gt: 1 } } },
      { $count: 'repeatCustomers' },
    ]);
    const repeatCustomersCount = repeatCustomerAggregation[0]?.repeatCustomers || 0;
    const repeatCustomerRatio = totalUsersCount > 0
      ? Math.round((repeatCustomersCount / totalUsersCount) * 100)
      : 0;

    // 3. Conversion Rate & Abandonment Rate Estimation
    // Estimated conversion rate based on active registered users vs ordering users
    const orderingUsersCount = (
      await Order.distinct('user')
    ).length;
    const conversionRate = totalUsersCount > 0
      ? Number(((orderingUsersCount / totalUsersCount) * 100).toFixed(1))
      : 0;

    // 4. Refund Rate
    const refundedOrdersCount = await Order.countDocuments({
      'refundDetails.status': 'COMPLETED',
    });
    const refundRate = totalOrdersCount > 0
      ? Number(((refundedOrdersCount / totalOrdersCount) * 100).toFixed(1))
      : 0;

    // 5. Top Selling Products
    const topProducts = await Order.aggregate([
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          name: { $first: '$orderItems.name' },
          image: { $first: '$orderItems.image' },
          totalSold: { $sum: '$orderItems.quantity' },
          totalRevenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    // 6. Monthly Sales Trend (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlySales = await Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // 7. Order Status Breakdown
    const statusBreakdown = await Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      totalRevenue,
      totalOrders: totalOrdersCount,
      totalPaidOrders,
      avgOrderValue,
      totalCustomers: totalUsersCount,
      repeatCustomerRatio,
      conversionRate,
      refundRate,
      topProducts,
      monthlySales,
      statusBreakdown,
    };
  }
}

module.exports = new AnalyticsService();
