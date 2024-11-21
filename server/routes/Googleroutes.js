// server/routes/Googleroutes.js
const express = require('express');
const router = express.Router();
const { verifyGoogleUser } = require('../controllers/GoogleController');

// Route to verify Google user email and check position
router.post('/auth/verify-google-users', verifyGoogleUser);

module.exports = router;
