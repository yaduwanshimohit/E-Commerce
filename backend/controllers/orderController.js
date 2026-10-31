const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const notificationService = require('../services/notificationService');
const auditLogService = require('../services/auditLogService');

// @desc    Create new order with server-side price and stock validation
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    couponCode,
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items provided');
  }

  if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.pincode) {
    res.status(400);
    throw new Error('Incomplete shipping address');
  }

  // 1. Server-side validation of products, prices and stock availability
  let validatedSubtotal = 0;
  const verifiedOrderItems = [];

  for (const item of orderItems) {
    const dbProduct = await Product.findById(item.product);

    if (!dbProduct) {
      res.status(404);
      throw new Error(`Product not found: ${item.name}`);
    }

    let itemPrice = dbProduct.discountPrice;
    let selectedVariant = null;

    if (item.variantId && dbProduct.hasVariants && dbProduct.variants) {
      selectedVariant = dbProduct.variants.id(item.variantId) || dbProduct.variants.find((v) => v._id?.toString() === item.variantId);
    }

    if (selectedVariant) {
      if (selectedVariant.stock < item.quantity) {
        res.status(400);
        throw new Error(`Insufficient stock for "${dbProduct.name} (${item.variantInfo || 'Selected Variant'})". Available: ${selectedVariant.stock}`);
      }
      itemPrice = selectedVariant.discountPrice || selectedVariant.price || dbProduct.discountPrice;
    } else {
      if (dbProduct.stock < item.quantity) {
        res.status(400);
        throw new Error(`Insufficient stock for "${dbProduct.name}". Available: ${dbProduct.stock}`);
      }
    }

    validatedSubtotal += itemPrice * item.quantity;

    verifiedOrderItems.push({
      product: dbProduct._id,
      name: dbProduct.name,
      image: (selectedVariant && selectedVariant.images && selectedVariant.images[0]) || dbProduct.images[0] || '',
      price: itemPrice,
      quantity: item.quantity,
      variantId: item.variantId || (selectedVariant ? selectedVariant._id.toString() : undefined),
      variantInfo: item.variantInfo || (selectedVariant && selectedVariant.attributes ? selectedVariant.attributes.map(a => `${a.name}: ${a.value}`).join(', ') : ''),
      sku: item.sku || (selectedVariant ? selectedVariant.sku : ''),
    });
  }

  // 2. Validate Coupon if applied
  let discountAmount = 0;
  let appliedCouponCode = '';

  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true,
    });

    if (coupon) {
      const now = new Date();
      if (coupon.expiryDate > now && validatedSubtotal >= coupon.minOrderAmount) {
        if (coupon.discountType === 'PERCENTAGE') {
          discountAmount = (validatedSubtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscountAmount > 0 && discountAmount > coupon.maxDiscountAmount) {
            discountAmount = coupon.maxDiscountAmount;
          }
        } else if (coupon.discountType === 'FIXED') {
          discountAmount = coupon.discountValue;
        }
        appliedCouponCode = coupon.code;
        coupon.usedCount += 1;
        await coupon.save();
      }
    }
  }

  // 3. Shipping fee calculation (Free above ₹499)
  const shippingFee = validatedSubtotal > 499 ? 0 : 50;
  
  // 4. GST Tax & Invoice Calculation (Configurable Tax Rate)
  const gstRate = 18; // 18% standard GST rate
  const netAmount = Math.max(0, validatedSubtotal - discountAmount);
  const taxableAmount = Math.round(netAmount / (1 + gstRate / 100));
  const taxAmount = Math.round(netAmount - taxableAmount);
  const cgstAmount = Math.round(taxAmount / 2);
  const sgstAmount = taxAmount - cgstAmount;

  const totalAmount = Math.max(0, Math.round(netAmount + shippingFee));

  const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const invoiceDate = new Date();

  // Logistics & Tracking Defaults
  const estimatedDeliveryDate = new Date();
  estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 4);
  const trackingNumber = `AWB${Math.floor(100000000 + Math.random() * 900000000)}`;

  // 5. Create Order
  const order = new Order({
    user: req.user._id,
    orderItems: verifiedOrderItems,
    shippingAddress,
    paymentMethod,
    paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
    orderStatus: 'PLACED',
    refundStatus: 'NOT_APPLICABLE',
    returnStatus: 'NONE',
    courierPartner: 'Delhivery Express',
    trackingNumber,
    shipmentStatus: 'LABEL_CREATED',
    estimatedDeliveryDate,
    invoiceNumber,
    invoiceDate,
    gstRate,
    taxableAmount,
    cgstAmount,
    sgstAmount,
    igstAmount: 0,
    subtotal: validatedSubtotal,
    taxAmount,
    shippingFee,
    discountAmount: Math.round(discountAmount),
    couponCode: appliedCouponCode,
    totalAmount,
  });

  const createdOrder = await order.save();

  // 6. Update Product & Variant stock
  for (const item of verifiedOrderItems) {
    if (item.variantId) {
      await Product.updateOne(
        { _id: item.product, 'variants._id': item.variantId },
        { $inc: { 'variants.$.stock': -item.quantity, stock: -item.quantity } }
      );
    } else {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }
  }

  res.status(201).json({
    success: true,
    order: createdOrder,
  });
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, orders });
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email mobile');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check if current user is owner or admin
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.json({ success: true, order });
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
    res.status(403);
    throw new Error('Not authorized to cancel this order');
  }

  if (['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.orderStatus)) {
    res.status(400);
    throw new Error(`Order cannot be cancelled as it is already ${order.orderStatus.toLowerCase()}`);
  }

  order.orderStatus = 'CANCELLED';
  const updatedOrder = await order.save();

  // Restock items
  for (const item of order.orderItems) {
    if (item.variantId) {
      await Product.updateOne(
        { _id: item.product, 'variants._id': item.variantId },
        { $inc: { 'variants.$.stock': item.quantity, stock: item.quantity } }
      );
    } else {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }
  }

  res.json({ success: true, message: 'Order cancelled successfully', order: updatedOrder });
});

// @desc    Submit Return or Replacement Request (Customer)
// @route   PUT /api/orders/:id/return-request
// @access  Private
const submitReturnReplacement = asyncHandler(async (req, res) => {
  const { requestType, returnReason, returnDetails } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to request return for this order');
  }

  if (order.orderStatus !== 'DELIVERED') {
    res.status(400);
    throw new Error('Return or Replacement can only be requested for delivered orders');
  }

  order.requestType = ['RETURN', 'REPLACEMENT'].includes(requestType) ? requestType : 'RETURN';
  order.returnReason = returnReason || 'Defective/Damaged Item';
  order.returnDetails = returnDetails || '';
  order.returnStatus = requestType === 'REPLACEMENT' ? 'REPLACEMENT_REQUESTED' : 'RETURN_REQUESTED';
  order.refundStatus = 'REQUESTED';

  const updatedOrder = await order.save();
  res.json({
    success: true,
    message: `${order.requestType === 'REPLACEMENT' ? 'Replacement' : 'Return'} request submitted successfully`,
    order: updatedOrder,
  });
});

// --- ADMIN ORDER & LOGISTICS MANAGEMENT ---

// @desc    Get all orders (Admin)
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAllOrdersAdmin = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate('user', 'name email mobile')
    .sort({ createdAt: -1 });

  res.json({ success: true, orders });
});

// @desc    Update order status (Admin)
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatusAdmin = asyncHandler(async (req, res) => {
  const { orderStatus, paymentStatus, refundStatus, returnStatus } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const oldOrderStatus = order.orderStatus;
  const oldPaymentStatus = order.paymentStatus;
  const oldRefundStatus = order.refundStatus;

  if (orderStatus) {
    order.orderStatus = orderStatus;
    if (orderStatus === 'DELIVERED') {
      order.deliveredAt = Date.now();
      order.paymentStatus = 'PAID';
      order.shipmentStatus = 'DELIVERED';
    }
  }

  if (paymentStatus) {
    order.paymentStatus = paymentStatus;
    if (paymentStatus === 'PAID' && !order.paidAt) {
      order.paidAt = Date.now();
    }
  }

  if (refundStatus) order.refundStatus = refundStatus;
  if (returnStatus) order.returnStatus = returnStatus;

  const updatedOrder = await order.save();

  // Audit log administrative action
  await auditLogService.logAction({
    req,
    action: 'ORDER_STATUS_UPDATED',
    resource: 'Order',
    resourceId: order._id,
    resourceName: `Order #${order._id.toString().slice(-6).toUpperCase()}`,
    oldValue: { orderStatus: oldOrderStatus, paymentStatus: oldPaymentStatus, refundStatus: oldRefundStatus },
    newValue: { orderStatus: order.orderStatus, paymentStatus: order.paymentStatus, refundStatus: order.refundStatus },
  });

  // Dispatch In-App/Email/SMS Notifications
  if (orderStatus && orderStatus !== oldOrderStatus) {
    let title = 'Order Update';
    let message = `Your order #${order._id.toString().slice(-6).toUpperCase()} status is now ${orderStatus}.`;
    let type = 'ORDER';

    if (orderStatus === 'SHIPPED') {
      type = 'ORDER_SHIPPED';
      title = 'Order Shipped 🚚';
      message = `Your order #${order._id.toString().slice(-6).toUpperCase()} has been shipped via ${order.courierPartner}. Tracking AWB: ${order.trackingNumber}`;
    } else if (orderStatus === 'DELIVERED') {
      type = 'ORDER_DELIVERED';
      title = 'Order Delivered 🎉';
      message = `Your order #${order._id.toString().slice(-6).toUpperCase()} has been delivered successfully!`;
    }

    await notificationService.sendNotification({
      userId: order.user,
      type,
      title,
      message,
      link: `/orders/${order._id}`,
    });
  }

  res.json({ success: true, order: updatedOrder });
});

// @desc    Update Shipping & Logistics details (Admin)
// @route   PUT /api/admin/orders/:id/logistics
// @access  Private/Admin
const adminUpdateLogistics = asyncHandler(async (req, res) => {
  const { courierPartner, trackingNumber, shipmentStatus, estimatedDeliveryDate } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (courierPartner) order.courierPartner = courierPartner;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (shipmentStatus) order.shipmentStatus = shipmentStatus;
  if (estimatedDeliveryDate) order.estimatedDeliveryDate = estimatedDeliveryDate;

  if (shipmentStatus === 'SHIPPED') order.orderStatus = 'SHIPPED';
  if (shipmentStatus === 'OUT_FOR_DELIVERY') order.orderStatus = 'OUT_FOR_DELIVERY';
  if (shipmentStatus === 'DELIVERED') {
    order.orderStatus = 'DELIVERED';
    order.paymentStatus = 'PAID';
    order.deliveredAt = Date.now();
  }

  const updatedOrder = await order.save();
  res.json({ success: true, message: 'Logistics updated successfully', order: updatedOrder });
});

// @desc    Process Admin Decision for Return/Replacement Request
// @route   PUT /api/admin/orders/:id/return-decision
// @access  Private/Admin
const adminDecisionReturn = asyncHandler(async (req, res) => {
  const { decision, adminNote, returnStatus } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (decision === 'APPROVE') {
    order.returnStatus = returnStatus || 'APPROVED';
    order.refundStatus = order.requestType === 'RETURN' ? 'APPROVED' : 'NOT_APPLICABLE';
  } else if (decision === 'REJECT') {
    order.returnStatus = 'REJECTED';
    order.refundStatus = 'REJECTED';
  } else if (returnStatus) {
    order.returnStatus = returnStatus;
  }

  if (adminNote) order.adminDecisionNote = adminNote;

  const updatedOrder = await order.save();
  res.json({ success: true, message: 'Return request decision updated', order: updatedOrder });
});

// @desc    Process Refund (Admin)
// @route   PUT /api/admin/orders/:id/process-refund
// @access  Private/Admin
const adminProcessRefund = asyncHandler(async (req, res) => {
  const { refundAmount, refundTransactionId } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.refundStatus = 'REFUNDED';
  order.refundAmount = refundAmount || order.totalAmount;
  order.refundTransactionId = refundTransactionId || `RFD_${Date.now()}`;
  order.paymentStatus = 'PAID';

  const updatedOrder = await order.save();
  res.json({ success: true, message: 'Refund processed successfully', order: updatedOrder });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  submitReturnReplacement,
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
  adminUpdateLogistics,
  adminDecisionReturn,
  adminProcessRefund,
};
