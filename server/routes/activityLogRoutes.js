const express = require('express');
const router = express.Router();
const { logActivity, getActivityLogs } = require('../controllers/activityLogController');
const auth = require('../middleware/auth');

// Add auth middleware to protect these routes
router.use(auth);

router.post('/activity-log', logActivity);
router.get('/history-logs', getActivityLogs);

module.exports = router; 