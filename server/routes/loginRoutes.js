// server/routes/authRoutes.js
const express = require('express');
const { login } = require('../controllers/userController');
const router = express.Router();

// Login route
router.post('/', login);

module.exports = router;
