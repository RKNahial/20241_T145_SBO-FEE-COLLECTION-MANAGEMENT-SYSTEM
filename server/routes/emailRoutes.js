const express = require('express');
const router = express.Router();
const { sendPaymentDetails } = require('../controllers/emailController');

router.post('/send-payment-details', sendPaymentDetails);

module.exports = router; 