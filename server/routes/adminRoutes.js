const express = require('express');
const router = express.Router();
const adminController = require('../controllers/AdminController');
const authMiddleware = require('../middleware/authMiddleware');

// Get all admins
router.get('/admins', authMiddleware, adminController.getAllAdmins);
router.get('/admins/:id', authMiddleware, adminController.getAdminById);
router.put('/admins/:id', authMiddleware, adminController.updateAdmin);
router.put('/admins/:id/archive', authMiddleware, adminController.toggleArchiveStatus);
router.put('/admins/:id/unarchive', authMiddleware, adminController.toggleArchiveStatus);

// Login and register routes

module.exports = router; 