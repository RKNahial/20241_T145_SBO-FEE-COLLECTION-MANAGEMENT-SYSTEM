const RolePermission = require('../models/RolePermission');
const HistoryLog = require('../models/HistoryLog');

exports.updatePermissions = async (req, res) => {
    try {
        const { userId, permissions } = req.body;
        
        if (!userId || !permissions) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: userId and permissions'
            });
        }

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
            userName: req.user.name || 'Unknown',
            userEmail: req.user.email || 'Unknown',
            userPosition: req.user.position || 'Unknown',
            action: 'Update Permissions',
            details: `Updated permissions for user: ${req.body.userName || userId}`,
            status: 'completed'
        });

        res.status(200).json({
            success: true,
            message: 'Permissions updated successfully',
            data: rolePermission
        });
    } catch (error) {
        console.error('Error updating permissions:', error);
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
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameter: userId'
            });
        }

        const rolePermission = await RolePermission.findOne({ userId });
        
        res.status(200).json({
            success: true,
            data: rolePermission?.permissions || {}
        });
    } catch (error) {
        console.error('Error fetching permissions:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching permissions',
            error: error.message
        });
    }
};