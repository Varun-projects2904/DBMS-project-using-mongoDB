const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const { listProducts, getProduct } = require('../controllers/productController');

router.get('/', asyncHandler(listProducts));
router.get('/:id', asyncHandler(getProduct));

module.exports = router;
