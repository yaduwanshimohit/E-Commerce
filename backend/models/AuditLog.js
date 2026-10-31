const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    adminEmail: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
      // e.g. "PRODUCT_PRICE_UPDATED", "STOCK_UPDATED", "ORDER_STATUS_CHANGED", "USER_ROLE_UPDATED", "REFUND_PROCESSED"
    },
    resource: {
      type: String,
      required: true,
      // e.g. "Product", "Order", "User", "Coupon"
    },
    resourceId: {
      type: String,
    },
    resourceName: {
      type: String,
    },
    oldValue: {
      type: mongoose.Schema.Types.Mixed,
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ resource: 1 });
auditLogSchema.index({ adminEmail: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
