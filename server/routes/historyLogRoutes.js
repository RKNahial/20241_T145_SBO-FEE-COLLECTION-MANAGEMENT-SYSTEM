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

// Get recent logs (limited to 10)
router.get('/history-logs/recent', auth, async (req, res) => {
    try {
        const logs = await loggingService.getRecentLogs();
        res.json({ success: true, logs });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching recent logs', 
            error: error.message 
        });
    }
});

// Get all logs with filters
router.get('/history-logs', auth, async (req, res) => {
    try {
        const filters = {
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            action: req.query.action
        };
        const logs = await loggingService.getLogs(filters);
        res.json({ success: true, logs });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching history logs', 
            error: error.message 
        });
    }
});

module.exports = router; 