const express = require('express');
const router = express.Router();
const driveController = require('../controllers/driveController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/upload', authMiddleware, driveController.uploadFile);

module.exports = router; 