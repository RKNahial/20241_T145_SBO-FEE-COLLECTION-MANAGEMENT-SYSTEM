const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/permissionMiddleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Student management
router.get('/students', checkPermission('updateStudent'), treasurerController.getStudents);
router.post('/students', checkPermission('addStudent'), treasurerController.addStudent);
router.put('/students/:id', checkPermission('updateStudent'), treasurerController.updateStudent);
router.put('/students/:id/archive', checkPermission('archiveStudent'), treasurerController.archiveStudent);
router.put('/students/:id/unarchive', checkPermission('unarchiveStudent'), treasurerController.unarchiveStudent);

// Payment management
router.get('/payment-categories', checkPermission('addPaymentCategory'), treasurerController.getPaymentCategories);
router.post('/payment-categories', checkPermission('addPaymentCategory'), treasurerController.addPaymentCategory);
router.put('/payment-categories/:id', checkPermission('updatePaymentCategory'), treasurerController.updatePaymentCategory);

// Dues management
router.get('/dues/:id', checkPermission('duesPayment'), treasurerController.getDuesPayment);
router.put('/dues/:id', checkPermission('duesPayment'), treasurerController.updateDuesPayment);
router.put('/dues/:id/toggle', checkPermission('toggleDuesPayment'), treasurerController.toggleDuesPayment);

module.exports = router;