const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const paymentFeeController = require('../controllers/paymentFeeController');

router.put('/payment-fee/update/:studentId', auth, paymentFeeController.updatePaymentStatus);
router.get('/payment-fee/details/:studentId', auth, paymentFeeController.getPaymentDetails);
router.get('/payment-fee/by-category/:categoryId', paymentFeeController.getPaymentsByCategory);
router.get('/payment-fee/recent-payments', paymentFeeController.getRecentPayments);
router.get('/payment-fee/total-fees', paymentFeeController.getTotalFees);
router.get('/payment-fee/reports', paymentFeeController.getPaymentReports);
router.get('/payment-fee/reports/by-program', paymentFeeController.getPaymentsByProgram);
router.get('/payment-fee/reports/by-program-total', paymentFeeController.getPaymentsByProgramTotal);

module.exports = router; 