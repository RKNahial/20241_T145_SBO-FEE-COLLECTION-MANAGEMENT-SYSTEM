const express = require('express');
const { loginTreasurer } = require('../controllers/Treasurerlogin'); // Ensure correct naming
const router = express.Router();

router.post('/login', loginTreasurer);  // This matches '/treasurer/login' in index.js

module.exports = router;
