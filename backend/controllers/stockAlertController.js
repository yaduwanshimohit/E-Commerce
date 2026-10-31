const asyncHandler = require('express-async-handler');
const StockAlert = require('../models/StockAlert');
const Product = require('../models/Product');

// @desc    Subscribe for Back-in-Stock Notification
// @route   POST /api/stock-alert/subscribe
// @access  Private
const subscribeStockAlert = asyncHandler(async (req, res) => {
  const { productId, variantId } = req.body;
  const product = await Product.findById(productId);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const existingAlert = await StockAlert.findOne({
    product: product._id,
    user: req.user._id,
    variantId: variantId || '',
    isNotified: false,
  });

  if (existingAlert) {
    return res.json({
      success: true,
      message: "You are already subscribed to back-in-stock alerts for this product!",
    });
  }

  const alert = new StockAlert({
    product: product._id,
    user: req.user._id,
    userEmail: req.user.email,
    productName: product.name,
    variantId: variantId || '',
  });

  await alert.save();

  res.status(201).json({
    success: true,
    message: `We will notify you immediately when ${product.name} is back in stock!`,
  });
});

module.exports = {
  subscribeStockAlert,
};
