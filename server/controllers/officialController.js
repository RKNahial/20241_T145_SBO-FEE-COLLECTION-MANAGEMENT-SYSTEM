const officialService = require('../services/officialService');
const bcrypt = require('bcrypt');

exports.getAllOfficials = async (req, res) => {
    try {
        const allOfficials = await officialService.getAllOfficials();
        res.status(200).json({
            success: true,
            data: allOfficials
        });
    } catch (error) {
        console.error('Error fetching officials:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch officials',
            error: error.message
        });
    }
};

exports.toggleArchiveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.query;
        const isArchiving = req.path.endsWith('/archive');

        const official = await officialService.toggleArchiveStatus(id, type, isArchiving);

        res.status(200).json({
            success: true,
            message: `Official ${isArchiving ? 'archived' : 'unarchived'} successfully`,
            data: official
        });
    } catch (error) {
        console.error('Error toggling archive status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update archive status',
            error: error.message
        });
    }
};

exports.getOfficialById = async (req, res) => {
    try {
        const { id } = req.params;
        const official = await officialService.getOfficialById(id);

        res.status(200).json({
            success: true,
            data: official
        });
    } catch (error) {
        console.error('Error fetching official:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch official',
            error: error.message
        });
    }
};

exports.updateOfficial = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const official = await officialService.updateOfficial(id, updateData);

        res.status(200).json({
            success: true,
            message: 'Official updated successfully',
            data: official
        });
    } catch (error) {
        console.error('Error updating official:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update official',
            error: error.message
        });
    }
};

// Governor Profile Management
exports.getGovernorProfile = async (req, res) => {
    try {
        const userId = req.userData.userId;
        
        const governor = await officialService.getOfficialById(userId);

        if (!governor) {
            return res.status(404).json({
                success: false,
                message: 'Governor profile not found'
            });
        }

        res.json({
            success: true,
            data: {
                name: governor.name,
                ID: governor.ID,
                email: governor.email,
                position: governor.position
            }
        });
    } catch (error) {
        console.error('Error fetching governor profile:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching governor profile',
            error: error.message
        });
    }
};

exports.updateGovernorProfile = async (req, res) => {
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

        const governor = await officialService.updateOfficial(userId, updateData);

        if (!governor) {
            return res.status(404).json({
                success: false,
                message: 'Governor profile not found'
            });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                name: governor.name,
                ID: governor.ID,
                email: governor.email,
                position: governor.position
            }
        });
    } catch (error) {
        console.error('Error updating governor profile:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating governor profile',
            error: error.message
        });
    }
};