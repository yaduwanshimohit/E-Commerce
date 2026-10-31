const express = require('express');
const router = express.Router();
const {
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.route('/addresses')
  .get(protect, getUserAddresses)
  .post(protect, addAddress);

router.route('/addresses/:id')
  .put(protect, updateAddress)
  .delete(protect, deleteAddress);

router.put('/addresses/:id/default', protect, setDefaultAddress);

module.exports = router;
