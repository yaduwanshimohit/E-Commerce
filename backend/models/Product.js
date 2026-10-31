const mongoose = require('mongoose');

const specificationSchema = new mongoose.Schema({
  key: { type: String, required: true },
  value: { type: String, required: true },
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      trim: true,
      default: '',
    },
    barcode: {
      type: String,
      trim: true,
      default: '',
    },
    hsnCode: {
      type: String,
      trim: true,
      default: '8517', // Default HSN Code for Electronics/Apparel
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    categoryName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPercent: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    specifications: [specificationSchema],
    features: [{ type: String }],
    warranty: {
      type: String,
      default: '1 Year Brand Warranty',
    },
    returnPolicy: {
      type: String,
      default: '7 Days Replacement Policy',
    },
    isFlashSale: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
    // Product Variants Support
    hasVariants: {
      type: Boolean,
      default: false,
    },
    attributes: [
      {
        name: { type: String, required: true }, // e.g., "Color", "Size"
        options: [{ type: String, required: true }], // e.g., ["Black", "White"], ["S", "M", "L"]
      },
    ],
    variants: [
      {
        sku: { type: String, trim: true },
        attributes: [
          {
            name: { type: String, required: true }, // e.g., "Color"
            value: { type: String, required: true }, // e.g., "Black"
          },
        ],
        price: { type: Number, required: true, min: 0 },
        discountPrice: { type: Number, required: true, min: 0 },
        stock: { type: Number, required: true, default: 0, min: 0 },
        images: [{ type: String }],
        isDefault: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
