const express = require('express');
const router = express.Router();
const { 
    updatePaymentStatus,
    getStudentPayments
} = require('../controllers/paymentFeeController');

router.put('/students/:studentId/payment', updatePaymentStatus);
router.get('/students/:studentId/payments', getStudentPayments);

module.exports = router; 