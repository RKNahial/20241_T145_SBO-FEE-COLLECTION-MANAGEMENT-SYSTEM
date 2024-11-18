const express = require('express');
const router = express.Router();
const paymentFeeController = require('../controllers/paymentFeeController');

router.get('/details/:studentId', paymentFeeController.getPaymentDetails);
router.put('/update/:studentId', paymentFeeController.updatePaymentStatus);
router.get('/by-category/:categoryId', paymentFeeController.getPaymentsByCategory);
router.get('/recent-payments', paymentFeeController.getRecentPayments);
router.get('/total-fees', paymentFeeController.getTotalFees);
router.get('/reports', paymentFeeController.getPaymentReports);
router.get('/reports/by-program', paymentFeeController.getPaymentsByProgram);
router.get('/reports/by-program-total', paymentFeeController.getPaymentsByProgramTotal);

module.exports = router; 