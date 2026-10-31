const express = require('express');
const router = express.Router();
const {
  getQuestionsForProduct,
  askQuestion,
  answerQuestion,
  getUnansweredQuestionsAdmin,
} = require('../controllers/qaController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.get('/:productId', getQuestionsForProduct);
router.post('/:productId', protect, askQuestion);

router.get('/admin/pending', protect, admin, getUnansweredQuestionsAdmin);
router.put('/:id/answer', protect, admin, answerQuestion);

module.exports = router;
