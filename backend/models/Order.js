const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  variantId: { type: String },
  variantInfo: { type: String },
  sku: { type: String },
  hsnCode: { type: String, default: '8517' },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderItems: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      mobileNumber: { type: String, required: true },
      houseFlat: { type: String, required: true },
      street: { type: String, required: true },
      area: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      landmark: { type: String },
      addressType: { type: String, default: 'Home' },
    },
    paymentMethod: {
      type: String,
      enum: ['Razorpay', 'COD'],
      required: true,
    },
    // SEPARATED STATUS FIELDS
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED'],
      default: 'PENDING',
    },
    orderStatus: {
      type: String,
      enum: [
        'PLACED',
        'CONFIRMED',
        'PROCESSING',
        'SHIPPED',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED',
      ],
      default: 'PLACED',
    },
    refundStatus: {
      type: String,
      enum: [
        'NOT_APPLICABLE',
        'REQUESTED',
        'APPROVED',
        'PROCESSING',
        'REFUNDED',
        'REJECTED',
      ],
      default: 'NOT_APPLICABLE',
    },
    returnStatus: {
      type: String,
      enum: [
        'NONE',
        'RETURN_REQUESTED',
        'REPLACEMENT_REQUESTED',
        'APPROVED',
        'REJECTED',
        'PICKUP_SCHEDULED',
        'PICKED_UP',
        'RECEIVED',
        'COMPLETED',
      ],
      default: 'NONE',
    },
    // LOGISTICS & SHIPPING DETAILS
    courierPartner: {
      type: String,
      default: 'Delhivery Express',
    },
    trackingNumber: {
      type: String,
      default: '',
    },
    shipmentStatus: {
      type: String,
      default: 'LABEL_CREATED',
    },
    estimatedDeliveryDate: {
      type: Date,
    },
    // GST TAX & INVOICE DETAILS
    invoiceNumber: {
      type: String,
      default: '',
    },
    invoiceDate: {
      type: Date,
    },
    gstRate: {
      type: Number,
      default: 18, // 18% standard GST
    },
    taxableAmount: {
      type: Number,
      default: 0,
    },
    cgstAmount: {
      type: Number,
      default: 0,
    },
    sgstAmount: {
      type: Number,
      default: 0,
    },
    igstAmount: {
      type: Number,
      default: 0,
    },
    subtotal: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    couponCode: { type: String, default: '' },
    totalAmount: { type: Number, required: true },
    // RETURN / REPLACEMENT WORKFLOW DETAILS
    requestType: {
      type: String,
      enum: ['RETURN', 'REPLACEMENT', 'NONE'],
      default: 'NONE',
    },
    returnReason: {
      type: String,
      default: '',
    },
    returnDetails: {
      type: String,
      default: '',
    },
    adminDecisionNote: {
      type: String,
      default: '',
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundTransactionId: {
      type: String,
      default: '',
    },
    razorpayOrderId: { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
    razorpaySignature: { type: String, default: '' },
    paidAt: { type: Date },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
