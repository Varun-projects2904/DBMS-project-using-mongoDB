const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const { checkUsername, login, signup } = require('../controllers/authController');

router.post('/check-username', asyncHandler(checkUsername));
router.post('/login', asyncHandler(login));
router.post('/signup', asyncHandler(signup));

module.exports = router;
