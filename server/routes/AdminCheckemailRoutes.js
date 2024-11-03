// routes/adminLogin.js
const express = require('express');
const { verifyGoogleUser } = require('../services/AdminGoogle');
const router = express.Router();

router.post('/verify-google-user', verifyGoogleUser); // Changed to /verify-google-user

module.exports = router;
