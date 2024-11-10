const express = require('express');
const router = express.Router();
const { updateDailyDues, getDailyDues } = require('../controllers/dailyDuesController');

router.get('/daily-dues', getDailyDues);
router.put('/daily-dues/:userId', updateDailyDues);

module.exports = router; 