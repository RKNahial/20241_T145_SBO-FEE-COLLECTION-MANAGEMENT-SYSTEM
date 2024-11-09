const express = require('express');
const router = express.Router();
const { processDuesPayment } = require('../controllers/duesPaymentController');

router.post('/payment', processDuesPayment);

module.exports = router; 