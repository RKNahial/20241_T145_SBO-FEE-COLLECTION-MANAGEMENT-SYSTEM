const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const paymentFeeController = require('../controllers/paymentFeeController');

// Lock-related routes
router.get('/payment-fee/:id/check-lock/:lockType', auth, paymentFeeController.checkLock);
router.post('/payment-fee/:id/acquire-lock/:lockType', auth, paymentFeeController.acquireLock);
router.delete('/payment-fee/:id/release-lock/:lockType', auth, paymentFeeController.releaseLock);

// Payment fee routes
router.put('/payment-fee/update/:studentId', auth, paymentFeeController.updatePaymentStatus);
router.get('/payment-fee/details/:studentId', auth, paymentFeeController.getPaymentDetails);
router.get('/payment-fee/by-category/:categoryId', paymentFeeController.getPaymentsByCategory);
router.get('/payment-fee/recent-payments', paymentFeeController.getRecentPayments);
router.get('/payment-fee/total-fees', paymentFeeController.getTotalFees);
router.get('/payment-fee/reports', paymentFeeController.getPaymentReports);
router.get('/payment-fee/reports/by-program', paymentFeeController.getPaymentsByProgram);
router.get('/payment-fee/reports/by-program-total', paymentFeeController.getPaymentsByProgramTotal);
router.get('/payment-fee/reports/expected-amounts', paymentFeeController.getExpectedAmounts);

module.exports = router; 