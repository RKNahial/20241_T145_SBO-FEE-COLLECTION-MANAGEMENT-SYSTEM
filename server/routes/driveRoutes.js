const express = require('express');
const router = express.Router();
const driveController = require('../controllers/driveController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/drive/upload', authMiddleware, driveController.uploadFile);
router.get('/drive/files', authMiddleware, driveController.listFiles);
router.delete('/drive/files/:fileId', authMiddleware, driveController.deleteFile);

module.exports = router; 