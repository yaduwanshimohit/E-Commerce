const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    image: { type: String, required: true },
    linkUrl: { type: String, default: '/products' },
    buttonText: { type: String, default: 'Shop Now' },
    badgeText: { type: String, default: 'LIMITED TIME OFFER' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Banner', bannerSchema);
