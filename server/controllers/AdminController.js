const Admin = require('../models/AdminSchema');
const Student = require('../models/studentSchema');
const Officer = require('../models/OfficerSchema');

exports.getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find().select('-password');
        res.status(200).json({
            success: true,
            data: admins
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching admins',
            error: error.message
        });
    }
};

exports.toggleArchiveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const admin = await Admin.findById(id);
        
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        admin.isArchived = !admin.isArchived;
        admin.archivedAt = admin.isArchived ? new Date() : null;
        await admin.save();

        res.status(200).json({
            success: true,
            message: `Admin ${admin.isArchived ? 'archived' : 'unarchived'} successfully`,
            data: admin
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error toggling archive status',
            error: error.message
        });
    }
};

exports.getAdminById = async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id).select('-password');
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }
        res.status(200).json({
            success: true,
            data: admin
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching admin',
            error: error.message
        });
    }
};

exports.updateAdmin = async (req, res) => {
    try {
        const { name, ID, email } = req.body;
        const admin = await Admin.findById(req.params.id);

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        // Update fields
        admin.name = name || admin.name;
        admin.ID = ID || admin.ID;
        admin.email = email || admin.email;

        await admin.save();

        res.status(200).json({
            success: true,
            message: 'Admin updated successfully',
            data: admin
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating admin',
            error: error.message
        });
    }
};

exports.getActiveStudentsCount = async (req, res) => {
    try {
        const count = await Student.countDocuments({ isArchived: false });
        res.json({ count });
    } catch (error) {
        console.error('Error counting students:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getActiveOfficersCount = async (req, res) => {
    try {
        const count = await Officer.countDocuments({ isArchived: false });
        res.json({ count });
    } catch (error) {
        console.error('Error counting officers:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getActiveAdminsCount = async (req, res) => {
    try {
        const count = await Admin.countDocuments({ isArchived: false });
        res.json({ count });
    } catch (error) {
        console.error('Error counting admins:', error);
        res.status(500).json({ message: error.message });
    }
};


