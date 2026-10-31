const express = require('express');
const router = express.Router();
const { checkPincodeServiceability } = require('../controllers/pincodeController');

router.get('/check/:code', checkPincodeServiceability);

module.exports = router;
