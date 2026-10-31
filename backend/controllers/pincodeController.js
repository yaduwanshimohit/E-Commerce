const asyncHandler = require('express-async-handler');
const Pincode = require('../models/Pincode');

// @desc    Check Indian 6-digit Pincode Serviceability & Delivery Estimate
// @route   GET /api/pincode/check/:code
// @access  Public
const checkPincodeServiceability = asyncHandler(async (req, res) => {
  const code = req.params.code?.trim();

  if (!code || !/^\d{6}$/.test(code)) {
    res.status(400);
    throw new Error('Please enter a valid 6-digit Indian pincode');
  }

  // Check database or generate dynamic estimate for standard Indian pincodes
  let pincodeData = await Pincode.findOne({ pincode: code });

  if (!pincodeData) {
    // Metro / Major Tier-1 & Tier-2 pincode heuristics
    const firstDigit = code[0];
    const isTier1 = ['1', '4', '5', '6', '7'].includes(firstDigit);
    const days = isTier1 ? 3 : 5;

    pincodeData = {
      pincode: code,
      city: isTier1 ? 'Metro / Major City' : 'Regional Hub',
      state: 'India',
      isServiceable: true,
      deliveryDays: days,
      codAvailable: true,
      courierPartner: isTier1 ? 'Delhivery Express' : 'BlueDart Courier',
    };
  }

  // Calculate estimated delivery date
  const estDate = new Date();
  estDate.setDate(estDate.getDate() + pincodeData.deliveryDays);

  const formattedDate = estDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  res.json({
    success: true,
    data: {
      ...pincodeData,
      estimatedDeliveryDate: formattedDate,
      estimatedDays: pincodeData.deliveryDays,
    },
  });
});

module.exports = {
  checkPincodeServiceability,
};
