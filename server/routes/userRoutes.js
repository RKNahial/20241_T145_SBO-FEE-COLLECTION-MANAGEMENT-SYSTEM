const express = require('express');
const { registerUser, getSessionHistory } = require('../controllers/userController');
const router = express.Router();

// Register route
router.post('/register', registerUser);

// Add this new route
router.get('/session-history', getSessionHistory);

module.exports = router;
//exports