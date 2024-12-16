const express = require('express');
const router = express.Router();
const authController = require('../controllers/OTPController');

router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);

module.exports = router; 