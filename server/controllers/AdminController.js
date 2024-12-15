const Admin = require('../models/AdminSchema');
const Student = require('../models/studentSchema');
const Officer = require('../models/OfficerSchema');
const bcrypt = require('bcrypt');

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

exports.getAdminProfile = async (req, res) => {
    try {
        // Get user ID from the token
        const userId = req.userData.userId;
        
        const admin = await Admin.findById(userId)
            .select('-password -__v');

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        res.json({
            success: true,
            data: {
                name: admin.name,
                ID: admin.ID,
                email: admin.email,
                position: admin.position
            }
        });
    } catch (error) {
        console.error('Error fetching admin profile:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching admin profile',
            error: error.message
        });
    }
};

exports.updateAdminProfile = async (req, res) => {
    try {
        const userId = req.userData.userId;
        const { name, ID, email, password } = req.body;

        const updateData = {
            name,
            ID,
            email
        };

        // Only hash and update password if it's provided
        if (password && password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }

        const admin = await Admin.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true }
        ).select('-password -__v');

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                name: admin.name,
                ID: admin.ID,
                email: admin.email,
                position: admin.position
            }
        });
    } catch (error) {
        console.error('Error updating admin profile:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating admin profile',
            error: error.message
        });
    }
};


