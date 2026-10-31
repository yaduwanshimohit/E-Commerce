const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      default: '',
    },
    answeredBy: {
      type: String,
      default: 'NexCart Verified Seller',
    },
    isAnswered: {
      type: Boolean,
      default: false,
    },
    answeredAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', questionSchema);
