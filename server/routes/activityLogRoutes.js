const express = require('express');
const router = express.Router();
const { logActivity, getActivityLogs } = require('../controllers/activityLogController');

router.post('/activity-log', logActivity);
router.get('/activity-logs', getActivityLogs);

module.exports = router; 