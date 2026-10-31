const asyncHandler = require('express-async-handler');
const Address = require('../models/Address');
const User = require('../models/User');

// --- ADDRESS MANAGEMENT ---

// @desc    Get all addresses for logged in user
// @route   GET /api/users/addresses
// @access  Private
const getUserAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
  res.json({ success: true, addresses });
});

// @desc    Add new address
// @route   POST /api/users/addresses
// @access  Private
const addAddress = asyncHandler(async (req, res) => {
  const {
    fullName,
    mobileNumber,
    houseFlat,
    street,
    area,
    city,
    state,
    pincode,
    landmark,
    addressType,
    isDefault,
  } = req.body;

  if (isDefault) {
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
  }

  // If this is user's first address, set as default
  const count = await Address.countDocuments({ user: req.user._id });
  const makeDefault = count === 0 ? true : Boolean(isDefault);

  const address = await Address.create({
    user: req.user._id,
    fullName,
    mobileNumber,
    houseFlat,
    street,
    area,
    city,
    state,
    pincode,
    landmark: landmark || '',
    addressType: addressType || 'Home',
    isDefault: makeDefault,
  });

  res.status(201).json({ success: true, address });
});

// @desc    Update address
// @route   PUT /api/users/addresses/:id
// @access  Private
const updateAddress = asyncHandler(async (req, res) => {
  const address = await Address.findById(req.params.id);

  if (!address || address.user.toString() !== req.user._id.toString()) {
    res.status(404);
    throw new Error('Address not found');
  }

  if (req.body.isDefault) {
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
  }

  address.fullName = req.body.fullName || address.fullName;
  address.mobileNumber = req.body.mobileNumber || address.mobileNumber;
  address.houseFlat = req.body.houseFlat || address.houseFlat;
  address.street = req.body.street || address.street;
  address.area = req.body.area || address.area;
  address.city = req.body.city || address.city;
  address.state = req.body.state || address.state;
  address.pincode = req.body.pincode || address.pincode;
  address.landmark = req.body.landmark !== undefined ? req.body.landmark : address.landmark;
  address.addressType = req.body.addressType || address.addressType;
  address.isDefault = req.body.isDefault !== undefined ? req.body.isDefault : address.isDefault;

  const updatedAddress = await address.save();
  res.json({ success: true, address: updatedAddress });
});

// @desc    Delete address
// @route   DELETE /api/users/addresses/:id
// @access  Private
const deleteAddress = asyncHandler(async (req, res) => {
  const address = await Address.findById(req.params.id);

  if (!address || address.user.toString() !== req.user._id.toString()) {
    res.status(404);
    throw new Error('Address not found');
  }

  await address.deleteOne();
  res.json({ success: true, message: 'Address deleted successfully' });
});

// @desc    Set default address
// @route   PUT /api/users/addresses/:id/default
// @access  Private
const setDefaultAddress = asyncHandler(async (req, res) => {
  await Address.updateMany({ user: req.user._id }, { isDefault: false });
  const address = await Address.findById(req.params.id);

  if (!address || address.user.toString() !== req.user._id.toString()) {
    res.status(404);
    throw new Error('Address not found');
  }

  address.isDefault = true;
  await address.save();
  res.json({ success: true, address });
});

// --- ADMIN USER MANAGEMENT ---

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password').sort({ createdAt: -1 });
  res.json({ success: true, users });
});

// @desc    Toggle block/unblock user (Admin)
// @route   PUT /api/admin/users/:id/block
// @access  Private/Admin
const toggleBlockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role === 'ADMIN') {
    res.status(400);
    throw new Error('Cannot block an Admin account');
  }

  user.isBlocked = !user.isBlocked;
  await user.save();
  res.json({
    success: true,
    message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
    user: { _id: user._id, name: user.name, isBlocked: user.isBlocked },
  });
});

module.exports = {
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getAllUsers,
  toggleBlockUser,
};
