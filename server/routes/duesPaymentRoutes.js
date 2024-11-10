const express = require('express');
const router = express.Router();
const { processDuesPayment } = require('../controllers/duesPaymentController');
const { updateDailyDues } = require('../controllers/dailyDuesController');

router.put('/daily-dues/:userId', updateDailyDues);

module.exports = router; 