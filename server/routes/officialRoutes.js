const express = require('express');
const router = express.Router();
const officialController = require('../controllers/officialController');
const authMiddleware = require('../middleware/authMiddleware');

// Get all officials
router.get('/officials', authMiddleware, officialController.getAllOfficials);

// Get single official
router.get('/officials/:id', authMiddleware, officialController.getOfficialById);

// Update official
router.put('/officials/:id', authMiddleware, officialController.updateOfficial);

// Archive/unarchive routes
router.put('/officials/:id/archive', authMiddleware, officialController.toggleArchiveStatus);
router.put('/officials/:id/unarchive', authMiddleware, officialController.toggleArchiveStatus);

module.exports = router; 