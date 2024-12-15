const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const dailyDuesController = require('../controllers/dailyDuesController');

router.get('/daily-dues', dailyDuesController.getDailyDues);
router.put('/daily-dues/:userId/toggle', auth, dailyDuesController.toggleDuesStatus);

module.exports = router; 