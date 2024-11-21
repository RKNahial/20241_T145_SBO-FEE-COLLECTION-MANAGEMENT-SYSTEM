const express = require('express');
const router = express.Router();
const adminController = require('../controllers/AdminController');
const authMiddleware = require('../middleware/authMiddleware');

// Admin management routes
router.get('/admins', authMiddleware, adminController.getAllAdmins);
router.get('/admins/:id', authMiddleware, adminController.getAdminById);
router.put('/admins/:id', authMiddleware, adminController.updateAdmin);
router.put('/admins/:id/archive', authMiddleware, adminController.toggleArchiveStatus);
router.put('/admins/:id/unarchive', authMiddleware, adminController.toggleArchiveStatus);

// Count routes
router.get('/admin/students/active/count', authMiddleware, adminController.getActiveStudentsCount);
router.get('/admin/officers/active/count', authMiddleware, adminController.getActiveOfficersCount);
router.get('/admin/admins/count', authMiddleware, adminController.getActiveAdminsCount);

module.exports = router; 