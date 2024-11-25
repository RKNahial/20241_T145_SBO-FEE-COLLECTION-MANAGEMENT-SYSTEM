const RolePermission = require('../models/RolePermission');
const HistoryLog = require('../models/HistoryLog');

exports.updatePermissions = async (req, res) => {
    try {
        const { userId, permissions } = req.body;
        
        let rolePermission = await RolePermission.findOne({ userId });
        
        if (!rolePermission) {
            rolePermission = new RolePermission({
                userId,
                position: req.body.position,
                permissions
            });
        } else {
            rolePermission.permissions = permissions;
        }
        
        await rolePermission.save();

        // Create history log
        await HistoryLog.create({
            timestamp: new Date(),
            userName: req.user.name,
            userEmail: req.user.email,
            userPosition: req.user.position,
            action: 'Update Permissions',
            details: `Updated permissions for user: ${req.body.userName}`,
            status: 'completed'
        });

        res.status(200).json({
            success: true,
            message: 'Permissions updated successfully',
            data: rolePermission
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating permissions',
            error: error.message
        });
    }
};

exports.getPermissions = async (req, res) => {
    try {
        const { userId } = req.params;
        const rolePermission = await RolePermission.findOne({ userId });
        
        res.status(200).json({
            success: true,
            data: rolePermission?.permissions || {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching permissions',
            error: error.message
        });
    }
};