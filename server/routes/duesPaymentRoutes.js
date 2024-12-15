const express = require('express');
const router = express.Router();
const { updateDailyDues  } = require('../controllers/dailyDuesController');
const duesPaymentController = require('../controllers/dailyDuesController');
const { getDailyDues } = require('../controllers/dailyDuesController');

router.put('/daily-dues/:userId', updateDailyDues);
router.put('/daily-dues/:userId/toggle-status', duesPaymentController.toggleDuesStatus);
router.get('/daily-dues', getDailyDues);

module.exports = router; 