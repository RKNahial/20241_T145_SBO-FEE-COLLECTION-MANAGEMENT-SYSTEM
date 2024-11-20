const ActivityLog = require('../models/ActivityLog');

exports.logActivity = async (req, res) => {
    try {
        const { userId, userPosition, action, details, timestamp, ipAddress } = req.body;
        
        const log = new ActivityLog({
            userId,
            userPosition,
            action,
            details,
            timestamp,
            ipAddress
        });

        await log.save();
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Activity log error:', error);
        res.status(500).json({ success: false, error: 'Failed to log activity' });
    }
};

exports.getActivityLogs = async (req, res) => {
    try {
        const logs = await ActivityLog.find()
            .sort({ timestamp: -1 })
            .limit(100);
        res.status(200).json({ success: true, logs });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch activity logs' });
    }
};

exports.getStudentActivityLogs = async (req, res) => {
    try {
        const { studentId } = req.params;
        const logs = await ActivityLog.find({ targetId: studentId })
            .sort({ timestamp: -1 });
        res.status(200).json({ success: true, logs });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch student activity logs' });
    }
};

exports.getPaymentActivityLogs = async (req, res) => {
    try {
        const { studentId } = req.params;
        const logs = await ActivityLog.find({
            targetId: studentId,
            targetType: 'payment'
        })
        .sort({ timestamp: -1 });
        
        res.status(200).json({ 
            success: true, 
            logs 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch payment activity logs' 
        });
    }
}; 