const asyncHandler = require('express-async-handler');
const Coupon = require('../models/Coupon');

// @desc    Validate a coupon code
// @route   POST /api/coupons/validate
// @access  Private
const validateCoupon = asyncHandler(async (req, res) => {
  const { code, cartTotal } = req.body;

  if (!code) {
    res.status(400);
    throw new Error('Please enter coupon code');
  }

  const coupon = await Coupon.findOne({
    code: code.toUpperCase().trim(),
    isActive: true,
  });

  if (!coupon) {
    res.status(404);
    throw new Error('Invalid or expired coupon code');
  }

  const now = new Date();
  if (coupon.expiryDate < now) {
    res.status(400);
    throw new Error('This coupon has expired');
  }

  if (cartTotal < coupon.minOrderAmount) {
    res.status(400);
    throw new Error(`Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`);
  }

  if (coupon.usedCount >= coupon.usageLimit) {
    res.status(400);
    throw new Error('Coupon usage limit reached');
  }

  let discountAmount = 0;
  if (coupon.discountType === 'PERCENTAGE') {
    discountAmount = (cartTotal * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount > 0 && discountAmount > coupon.maxDiscountAmount) {
      discountAmount = coupon.maxDiscountAmount;
    }
  } else if (coupon.discountType === 'FIXED') {
    discountAmount = coupon.discountValue;
  }

  res.json({
    success: true,
    message: 'Coupon applied successfully!',
    coupon: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: Math.round(discountAmount),
    },
  });
});

// @desc    Get all coupons (Admin)
// @route   GET /api/admin/coupons
// @access  Private/Admin
const getAllCouponsAdmin = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({}).sort({ createdAt: -1 });
  res.json({ success: true, coupons });
});

// @desc    Create new coupon (Admin)
// @route   POST /api/admin/coupons
// @access  Private/Admin
const createCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    discountType,
    discountValue,
    minOrderAmount,
    maxDiscountAmount,
    expiryDate,
    usageLimit,
  } = req.body;

  const existing = await Coupon.findOne({ code: code.toUpperCase() });
  if (existing) {
    res.status(400);
    throw new Error('Coupon code already exists');
  }

  const coupon = await Coupon.create({
    code: code.toUpperCase().trim(),
    discountType,
    discountValue,
    minOrderAmount: minOrderAmount || 0,
    maxDiscountAmount: maxDiscountAmount || 0,
    expiryDate: expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    usageLimit: usageLimit || 100,
    isActive: true,
  });

  res.status(201).json({ success: true, coupon });
});

// @desc    Update coupon (Admin)
// @route   PUT /api/admin/coupons/:id
// @access  Private/Admin
const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (coupon) {
    coupon.code = req.body.code ? req.body.code.toUpperCase() : coupon.code;
    coupon.discountType = req.body.discountType || coupon.discountType;
    coupon.discountValue = req.body.discountValue !== undefined ? req.body.discountValue : coupon.discountValue;
    coupon.minOrderAmount = req.body.minOrderAmount !== undefined ? req.body.minOrderAmount : coupon.minOrderAmount;
    coupon.maxDiscountAmount = req.body.maxDiscountAmount !== undefined ? req.body.maxDiscountAmount : coupon.maxDiscountAmount;
    coupon.expiryDate = req.body.expiryDate || coupon.expiryDate;
    coupon.usageLimit = req.body.usageLimit !== undefined ? req.body.usageLimit : coupon.usageLimit;
    coupon.isActive = req.body.isActive !== undefined ? req.body.isActive : coupon.isActive;

    const updatedCoupon = await coupon.save();
    res.json({ success: true, coupon: updatedCoupon });
  } else {
    res.status(404);
    throw new Error('Coupon not found');
  }
});

// @desc    Delete coupon (Admin)
// @route   DELETE /api/admin/coupons/:id
// @access  Private/Admin
const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (coupon) {
    await coupon.deleteOne();
    res.json({ success: true, message: 'Coupon deleted successfully' });
  } else {
    res.status(404);
    throw new Error('Coupon not found');
  }
});

module.exports = {
  validateCoupon,
  getAllCouponsAdmin,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};
