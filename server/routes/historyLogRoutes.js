const express = require('express');
const router = express.Router();
const loggingService = require('../services/loggingService');
const auth = require('../middleware/auth');
const historyLogController = require('../controllers/historyLogController');

router.post('/history-logs/category', auth, historyLogController.logCategoryAdded);

router.post('/history-logs/email', auth, historyLogController.logEmailSent);

router.post('/history-logs/category-archive', auth, historyLogController.logCategoryArchiveAction);

router.post('/history-logs/category-update', auth, historyLogController.logCategoryUpdate);

router.post('/history-logs/dues-toggle', auth, historyLogController.logDuesToggle);

router.post('/history-logs/dues-payment', auth, historyLogController.logDuesPayment);

router.get('/history-logs', auth, async (req, res) => {
    try {
        const filters = {
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            action: req.query.action
        };
        const logs = await loggingService.getLogs(filters);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching history logs', error: error.message });
    }
});

module.exports = router; 