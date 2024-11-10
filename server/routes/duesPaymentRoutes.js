const express = require('express');
const router = express.Router();
const { updateDailyDues } = require('../controllers/dailyDuesController');

// Route for updating daily dues
router.put('/daily-dues/:userId', updateDailyDues);

module.exports = router; 