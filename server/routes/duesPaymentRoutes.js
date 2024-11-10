const express = require('express');
const router = express.Router();
const { updateDailyDues  } = require('../controllers/dailyDuesController');

router.put('/daily-dues/:userId', updateDailyDues);

module.exports = router; 