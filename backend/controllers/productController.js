const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Category = require('../models/Category');
const StockAlert = require('../models/StockAlert');
const Notification = require('../models/Notification');
const auditLogService = require('../services/auditLogService');

// @desc    Fetch all products with filters, search, sort, and pagination
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 12;
  const page = Number(req.query.pageNumber) || 1;

  const keyword = req.query.keyword
    ? {
        $or: [
          { name: { $regex: req.query.keyword, $options: 'i' } },
          { brand: { $regex: req.query.keyword, $options: 'i' } },
          { categoryName: { $regex: req.query.keyword, $options: 'i' } },
          { description: { $regex: req.query.keyword, $options: 'i' } },
        ],
      }
    : {};

  const categoryFilter = req.query.category
    ? { categoryName: { $regex: new RegExp(`^${req.query.category}$`, 'i') } }
    : {};

  const brandFilter = req.query.brand
    ? { brand: { $in: req.query.brand.split(',') } }
    : {};

  const minPrice = Number(req.query.minPrice) || 0;
  const maxPrice = Number(req.query.maxPrice) || 1000000;
  const priceFilter = { discountPrice: { $gte: minPrice, $lte: maxPrice } };

  const ratingFilter = req.query.rating
    ? { rating: { $gte: Number(req.query.rating) } }
    : {};

  const discountFilter = req.query.minDiscount
    ? { discountPercent: { $gte: Number(req.query.minDiscount) } }
    : {};

  const inStockFilter = req.query.inStock === 'true' ? { stock: { $gt: 0 } } : {};

  const filterQuery = {
    ...keyword,
    ...categoryFilter,
    ...brandFilter,
    ...priceFilter,
    ...ratingFilter,
    ...discountFilter,
    ...inStockFilter,
  };

  // Sorting
  let sortOption = {};
  switch (req.query.sortBy) {
    case 'price_asc':
      sortOption = { discountPrice: 1 };
      break;
    case 'price_desc':
      sortOption = { discountPrice: -1 };
      break;
    case 'newest':
      sortOption = { createdAt: -1 };
      break;
    case 'rating':
      sortOption = { rating: -1 };
      break;
    case 'discount':
      sortOption = { discountPercent: -1 };
      break;
    case 'popularity':
    default:
      sortOption = { numReviews: -1, rating: -1 };
      break;
  }

  const count = await Product.countDocuments(filterQuery);
  const products = await Product.find(filterQuery)
    .sort(sortOption)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  // Get unique brands for filter sidebar
  const brands = await Product.distinct('brand', categoryFilter);

  res.json({
    success: true,
    products,
    page,
    pages: Math.ceil(count / pageSize),
    totalProducts: count,
    availableBrands: brands,
  });
});

// @desc    Get search suggestions for debounced auto-complete
// @route   GET /api/products/suggestions
// @access  Public
const getSearchSuggestions = asyncHandler(async (req, res) => {
  const query = req.query.q || '';
  if (!query || query.trim().length < 2) {
    return res.json({ success: true, suggestions: [] });
  }

  const products = await Product.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { brand: { $regex: query, $options: 'i' } },
      { categoryName: { $regex: query, $options: 'i' } },
    ],
  })
    .select('name brand categoryName slug discountPrice images')
    .limit(6);

  const categories = await Category.find({
    name: { $regex: query, $options: 'i' },
  }).select('name slug image').limit(3);

  res.json({
    success: true,
    suggestions: {
      products,
      categories,
    },
  });
});

// @desc    Fetch product by ID or Slug
// @route   GET /api/products/:idOrSlug
// @access  Public
const getProductByIdOrSlug = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  let product;

  if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
    product = await Product.findById(idOrSlug).populate('category', 'name slug');
  } else {
    product = await Product.findOne({ slug: idOrSlug }).populate('category', 'name slug');
  }

  if (product) {
    res.json({ success: true, product });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Get Flash Sale products
// @route   GET /api/products/flash-sale
// @access  Public
const getFlashSaleProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFlashSale: true }).limit(8);
  res.json({ success: true, products });
});

// @desc    Get Featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true }).limit(8);
  res.json({ success: true, products });
});

// @desc    Get Recommended products
// @route   GET /api/products/recommended
// @access  Public
const getRecommendedProducts = asyncHandler(async (req, res) => {
  const category = req.query.category;
  let query = {};
  if (category) {
    query = { categoryName: category };
  }
  const products = await Product.find(query).sort({ rating: -1 }).limit(8);
  res.json({ success: true, products });
});

// @desc    Create a product (Admin)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    brand,
    categoryName,
    description,
    price,
    discountPrice,
    stock,
    images,
    specifications,
    features,
    warranty,
    returnPolicy,
    isFlashSale,
    isFeatured,
    hasVariants,
    attributes,
    variants,
  } = req.body;

  let categoryObj = await Category.findOne({ name: categoryName });
  if (!categoryObj) {
    categoryObj = await Category.create({
      name: categoryName,
      slug: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      image: images && images[0] ? images[0] : 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500',
    });
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);
  const finalPrice = price || (variants && variants[0] ? variants[0].price : 0);
  const finalDiscountPrice = discountPrice || (variants && variants[0] ? variants[0].discountPrice : finalPrice);
  const discountPercent = finalPrice > 0 ? Math.round(((finalPrice - finalDiscountPrice) / finalPrice) * 100) : 0;

  // Calculate total stock if variants exist
  let calculatedStock = stock !== undefined ? Number(stock) : 0;
  if (hasVariants && variants && variants.length > 0) {
    calculatedStock = variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
  }

  const product = new Product({
    name,
    slug,
    brand,
    category: categoryObj._id,
    categoryName,
    description,
    price: finalPrice,
    discountPrice: finalDiscountPrice,
    discountPercent,
    stock: calculatedStock,
    images: images && images.length ? images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'],
    specifications: specifications || [],
    features: features || [],
    warranty: warranty || '1 Year Brand Warranty',
    returnPolicy: returnPolicy || '7 Days Replacement',
    isFlashSale: Boolean(isFlashSale),
    isFeatured: Boolean(isFeatured),
    hasVariants: Boolean(hasVariants),
    attributes: attributes || [],
    variants: variants || [],
  });

  const createdProduct = await product.save();
  res.status(201).json({ success: true, product: createdProduct });
});

// @desc    Update a product (Admin)
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    const {
      name,
      brand,
      categoryName,
      description,
      price,
      discountPrice,
      stock,
      images,
      specifications,
      features,
      warranty,
      returnPolicy,
      isFlashSale,
      isFeatured,
      hasVariants,
      attributes,
      variants,
    } = req.body;

    if (name) product.name = name;
    if (brand) product.brand = brand;
    if (description) product.description = description;
    if (price !== undefined) product.price = price;
    if (discountPrice !== undefined) product.discountPrice = discountPrice;
    if (stock !== undefined) product.stock = stock;
    if (images) product.images = images;
    if (specifications) product.specifications = specifications;
    if (features) product.features = features;
    if (warranty) product.warranty = warranty;
    if (returnPolicy) product.returnPolicy = returnPolicy;
    if (isFlashSale !== undefined) product.isFlashSale = isFlashSale;
    if (isFeatured !== undefined) product.isFeatured = isFeatured;
    if (hasVariants !== undefined) product.hasVariants = hasVariants;
    if (attributes) product.attributes = attributes;
    if (variants) {
      product.variants = variants;
      if (product.hasVariants) {
        product.stock = variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
      }
    }

    if (product.price && product.discountPrice) {
      product.discountPercent = Math.round(((product.price - product.discountPrice) / product.price) * 100);
    }

    if (categoryName && categoryName !== product.categoryName) {
      let cat = await Category.findOne({ name: categoryName });
      if (!cat) {
        cat = await Category.create({
          name: categoryName,
          slug: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          image: images && images[0] ? images[0] : 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500',
        });
      }
      product.category = cat._id;
      product.categoryName = categoryName;
    }

    const previousStock = product.stock;
    const previousPrice = product.price;
    const previousDiscountPrice = product.discountPrice;

    const updatedProduct = await product.save();

    // Log Administrative Audit Action
    await auditLogService.logAction({
      req,
      action: previousPrice !== updatedProduct.price ? 'PRODUCT_PRICE_UPDATED' : 'PRODUCT_UPDATED',
      resource: 'Product',
      resourceId: updatedProduct._id,
      resourceName: updatedProduct.name,
      oldValue: { price: previousPrice, discountPrice: previousDiscountPrice, stock: previousStock },
      newValue: { price: updatedProduct.price, discountPrice: updatedProduct.discountPrice, stock: updatedProduct.stock },
    });

    // Trigger Back-in-Stock Notifications if stock increased from 0 to >0
    if (previousStock === 0 && updatedProduct.stock > 0) {
      try {
        const pendingAlerts = await StockAlert.find({ product: updatedProduct._id, isNotified: false });
        for (const alert of pendingAlerts) {
          await Notification.create({
            user: alert.user,
            title: '🔥 Back in Stock!',
            message: `${updatedProduct.name} is now available in stock. Order yours before it sells out!`,
            type: 'STOCK',
            link: `/products/${updatedProduct.slug}`,
          });
          alert.isNotified = true;
          await alert.save();
        }
      } catch (err) {
        console.error('Stock notification error:', err);
      }
    }

    res.json({ success: true, product: updatedProduct });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a product (Admin)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.deleteOne();
    res.json({ success: true, message: 'Product removed successfully' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

module.exports = {
  getProducts,
  getSearchSuggestions,
  getProductByIdOrSlug,
  getFlashSaleProducts,
  getFeaturedProducts,
  getRecommendedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
