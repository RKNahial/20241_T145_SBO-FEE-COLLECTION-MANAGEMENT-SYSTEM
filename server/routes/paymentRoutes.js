const express = require('express');
const router = express.Router();
const paymentFeeController = require('../controllers/paymentFeeController');

router.get('/details/:studentId', paymentFeeController.getPaymentDetails);
router.put('/update/:studentId', paymentFeeController.updatePaymentStatus);

module.exports = router; 