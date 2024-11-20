const express = require('express');
const router = express.Router();
const adminController = require('../controllers/AdminController');
const authMiddleware = require('../middleware/authMiddleware');
const Student = require('../models/studentSchema');
const Officer = require('../models/OfficerSchema');
const Admin = require('../models/AdminSchema');

// Get all admins
router.get('/admins', authMiddleware, adminController.getAllAdmins);
router.get('/admins/:id', authMiddleware, adminController.getAdminById);
router.put('/admins/:id', authMiddleware, adminController.updateAdmin);
router.put('/admins/:id/archive', authMiddleware, adminController.toggleArchiveStatus);
router.put('/admins/:id/unarchive', authMiddleware, adminController.toggleArchiveStatus);

// Get count of active students
router.get('/admin/students/active/count', authMiddleware, async (req, res) => {
    try {
        const count = await Student.countDocuments({ status: 'Active' });
        res.json({ count });
    } catch (error) {
        console.error('Error counting students:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get count of active officers
router.get('/admin/officers/active/count', authMiddleware, async (req, res) => {
    try {
        const count = await Officer.countDocuments({ status: 'Active' });
        res.json({ count });
    } catch (error) {
        console.error('Error counting officers:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get count of admins
router.get('/admin/admins/count', authMiddleware, async (req, res) => {
    try {
        const count = await Admin.countDocuments({ status: 'Active' });
        res.json({ count });
    } catch (error) {
        console.error('Error counting admins:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get count of school years
router.get('/admin/school-years/count', authMiddleware, async (req, res) => {
    try {
        const count = await SchoolYear.countDocuments();
        res.json({ count });
    } catch (error) {
        console.error('Error counting school years:', error);
        res.status(500).json({ message: error.message });
    }
});

// Login and register routes

module.exports = router; 