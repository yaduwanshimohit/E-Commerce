const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Add review for a product
// @route   POST /api/reviews/:productId
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, title, comment } = req.body;
  const productId = req.params.productId;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check if user has already reviewed this product
  const alreadyReviewed = await Review.findOne({
    product: productId,
    user: req.user._id,
  });

  if (alreadyReviewed) {
    res.status(400);
    throw new Error('You have already submitted a review for this product');
  }

  // Check if user has actually purchased this product
  const hasPurchased = await Order.findOne({
    user: req.user._id,
    'orderItems.product': productId,
    orderStatus: { $in: ['DELIVERED', 'SHIPPED', 'CONFIRMED'] },
  });

  if (!hasPurchased) {
    res.status(403);
    throw new Error('Only customers who have purchased this product can leave a review');
  }

  const review = await Review.create({
    product: productId,
    user: req.user._id,
    userName: req.user.name,
    userAvatar: req.user.avatar || '',
    rating: Number(rating),
    title: title || '',
    comment,
    isVerifiedPurchase: true,
  });

  // Recalculate average rating & numReviews
  const reviews = await Review.find({ product: productId });
  product.numReviews = reviews.length;
  product.rating =
    reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

  await product.save();

  res.status(201).json({
    success: true,
    message: 'Review submitted successfully',
    review,
  });
});

// @desc    Get product reviews with distribution stats
// @route   GET /api/reviews/:productId
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
  const productId = req.params.productId;

  const reviews = await Review.find({ product: productId }).sort({ createdAt: -1 });

  const totalReviews = reviews.length;
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  reviews.forEach((r) => {
    if (distribution[r.rating] !== undefined) {
      distribution[r.rating] += 1;
    }
  });

  res.json({
    success: true,
    reviews,
    totalReviews,
    distribution,
  });
});

module.exports = {
  createProductReview,
  getProductReviews,
};
