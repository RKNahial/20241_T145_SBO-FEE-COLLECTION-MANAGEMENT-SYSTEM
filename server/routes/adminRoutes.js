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


// Add these routes
router.get('/admin/active-students-count', authMiddleware, adminController.getActiveStudentsCount);
router.get('/admin/active-officers-count', authMiddleware, adminController.getActiveOfficersCount);
router.get('/admin/active-admins-count', authMiddleware, adminController.getActiveAdminsCount);

router.get('/admin/profile', authMiddleware, adminController.getAdminProfile);
router.put('/admin/profile/update', authMiddleware, adminController.updateAdminProfile);

module.exports = router; 