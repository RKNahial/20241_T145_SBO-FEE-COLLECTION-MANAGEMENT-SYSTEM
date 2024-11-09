const express = require('express');
const router = express.Router();
const dailyDuesController = require('../controllers/dailyDuesController');

router.get('/', dailyDuesController.getDailyDues);
router.put('/:userId', dailyDuesController.updateDailyDues);

module.exports = router; 