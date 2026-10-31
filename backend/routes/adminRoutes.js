const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

const {
  getDashboardStats,
  getBanners,
  createBanner,
  deleteBanner,
} = require('../controllers/adminController');

const {
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
  adminUpdateLogistics,
  adminDecisionReturn,
  adminProcessRefund,
} = require('../controllers/orderController');

const {
  getAllUsers,
  toggleBlockUser,
} = require('../controllers/userController');

const {
  getAllCouponsAdmin,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require('../controllers/couponController');

// All endpoints in this router are protected & require admin role
router.use(protect, admin);

// Dashboard
router.get('/dashboard-stats', getDashboardStats);

// Orders
router.get('/orders', getAllOrdersAdmin);
router.put('/orders/:id/status', updateOrderStatusAdmin);
router.put('/orders/:id/logistics', adminUpdateLogistics);
router.put('/orders/:id/return-decision', adminDecisionReturn);
router.put('/orders/:id/process-refund', adminProcessRefund);

// Users
router.get('/users', getAllUsers);
router.put('/users/:id/block', toggleBlockUser);

// Coupons
router.route('/coupons')
  .get(getAllCouponsAdmin)
  .post(createCoupon);

router.route('/coupons/:id')
  .put(updateCoupon)
  .delete(deleteCoupon);

// Banners
router.route('/banners')
  .get(getBanners)
  .post(createBanner);

router.delete('/banners/:id', deleteBanner);

module.exports = router;
