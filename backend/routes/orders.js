const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const { purchase, getOrdersForCustomer } = require('../controllers/orderController');

router.post('/', asyncHandler(purchase));
router.get('/:custId', asyncHandler(getOrdersForCustomer));

module.exports = router;
