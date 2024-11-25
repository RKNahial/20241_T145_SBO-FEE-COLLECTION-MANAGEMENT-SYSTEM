const RolePermission = require('../models/RolePermission');

const checkPermission = (action) => async (req, res, next) => {
    try {
        const userId = req.user._id;
        const rolePermission = await RolePermission.findOne({ userId });

        if (!rolePermission || !rolePermission.permissions[action]) {
            return res.status(403).json({
                success: false,
                message: `Access denied: No ${action} permission found`
            });
        }

        const permission = rolePermission.permissions[action];
        
        // For write operations (POST, PUT, DELETE)
        if (['POST', 'PUT', 'DELETE'].includes(req.method) && permission !== 'edit') {
            return res.status(403).json({
                success: false,
                message: `Edit permission required for ${action}`
            });
        }

        // For read operations (GET)
        if (req.method === 'GET' && permission === 'denied') {
            return res.status(403).json({
                success: false,
                message: `View permission required for ${action}`
            });
        }

        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error checking permissions',
            error: error.message
        });
    }
};

module.exports = { checkPermission }; 