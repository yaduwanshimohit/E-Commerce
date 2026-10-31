const express = require('express');
const router = express.Router();
const {
  createProductReview,
  getProductReviews,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.route('/:productId')
  .get(getProductReviews)
  .post(protect, createProductReview);

module.exports = router;
