const express = require('express');
const router = express.Router();
const { subscribeStockAlert } = require('../controllers/stockAlertController');
const { protect } = require('../middleware/authMiddleware');

router.post('/subscribe', protect, subscribeStockAlert);

module.exports = router;
