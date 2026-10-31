const mongoose = require('mongoose');

const pincodeSchema = new mongoose.Schema(
  {
    pincode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    isServiceable: {
      type: Boolean,
      default: true,
    },
    deliveryDays: {
      type: Number,
      default: 3,
    },
    codAvailable: {
      type: Boolean,
      default: true,
    },
    courierPartner: {
      type: String,
      default: 'Delhivery Express',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Pincode', pincodeSchema);
