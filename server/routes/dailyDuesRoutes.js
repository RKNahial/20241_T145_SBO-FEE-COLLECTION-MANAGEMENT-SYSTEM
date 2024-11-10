const express = require('express');
const router = express.Router();
const { getDailyDues } = require('../controllers/dailyDuesController');

router.get('/daily-dues', getDailyDues);

module.exports = router; 