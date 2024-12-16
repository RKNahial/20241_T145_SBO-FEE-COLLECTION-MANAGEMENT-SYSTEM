const RolePermission = require('../models/RolePermission');
const HistoryLog = require('../models/HistoryLog');

exports.updatePermissions = async (req, res) => {
    try {
        const { userId, permissions, position, userName } = req.body;
        
        if (!userId || !permissions || !position) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: userId, permissions, and position'
            });
        }

        // Find existing permissions or create new
        let rolePermission = await RolePermission.findOne({ userId });
        
        if (!rolePermission) {
            rolePermission = new RolePermission({
                userId,
                position,
                permissions
            });
        } else {
            // Update existing permissions
            rolePermission.permissions = permissions;
            rolePermission.position = position;
        }
        
        await rolePermission.save();

        // Create history log
        await HistoryLog.create({
            timestamp: new Date(),
            userName: req.user?.name || 'Unknown',
            userEmail: req.user?.email || 'Unknown',
            userPosition: req.user?.position || 'Unknown',
            action: 'Update Permissions',
            details: `Updated permissions for user: ${userName || userId}`,
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
        
        // Return default permissions if none exist
        const defaultPermissions = {
            addStudent: 'denied',
            addPaymentCategory: 'denied',
            updateStudent: 'denied',
            updatePaymentCategory: 'denied',
            archiveStudent: 'denied',
            unarchiveStudent: 'denied',
            toggleDuesPayment: 'denied',
            duesPayment: 'denied',
            paymentUpdate: 'denied',
            archiveCategory: 'denied',
            unarchiveCategory: 'denied',
            emailNotifications: 'denied'
        };

        res.status(200).json({
            success: true,
            data: rolePermission?.permissions || defaultPermissions
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