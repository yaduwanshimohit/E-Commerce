const express = require('express');
const router = express.Router();
const {
  getProducts,
  getSearchSuggestions,
  getProductByIdOrSlug,
  getFlashSaleProducts,
  getFeaturedProducts,
  getRecommendedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);

router.get('/suggestions', getSearchSuggestions);
router.get('/flash-sale', getFlashSaleProducts);
router.get('/featured', getFeaturedProducts);
router.get('/recommended', getRecommendedProducts);

router.route('/:idOrSlug')
  .get(getProductByIdOrSlug);

router.route('/:id')
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

module.exports = router;
