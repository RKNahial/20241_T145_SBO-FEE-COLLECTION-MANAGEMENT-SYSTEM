const HistoryLog = require('../models/HistoryLog');

exports.logEmailSent = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const { studentId, studentName, studentEmail, paymentDetails } = req.body;

        if (!studentId || !studentName || !studentEmail || !paymentDetails) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        const log = await HistoryLog.create({
            userName: req.user.name,
            userEmail: req.user.email,
            userPosition: req.user.position,
            action: 'EMAIL_SENT',
            details: `${req.user.name} (${req.user.position}) sent payment details email to student: ${studentName}`,
            metadata: {
                studentId,
                studentName,
                studentEmail,
                paymentCategory: paymentDetails.category,
                paymentStatus: paymentDetails.status,
                totalPrice: paymentDetails.totalPrice,
                amountPaid: paymentDetails.amountPaid,
                emailType: 'Payment Details',
                sentAt: new Date()
            },
            status: 'completed'
        });

        res.status(200).json({
            success: true,
            message: 'Email sending logged successfully',
            log
        });
    } catch (error) {
        console.error('Error logging email:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging email sending',
            error: error.message
        });
    }
};

exports.logCategoryAdded = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const { categoryId, categoryDetails } = req.body;

        if (!categoryId || !categoryDetails) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        const log = await HistoryLog.create({
            userName: req.user.name,
            userEmail: req.user.email,
            userPosition: req.user.position,
            action: 'ADD_PAYMENT_CATEGORY',
            details: `${req.user.name} (${req.user.position}) added new payment category: ${categoryDetails.name}`,
            metadata: {
                categoryId,
                categoryDetails: {
                    id: categoryDetails.categoryId,
                    name: categoryDetails.name,
                    totalPrice: categoryDetails.totalPrice
                },
                createdAt: new Date()
            },
            status: 'completed'
        });

        res.status(200).json({
            success: true,
            message: 'Category addition logged successfully',
            log
        });
    } catch (error) {
        console.error('Error logging category addition:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging category addition',
            error: error.message
        });
    }
};

exports.logCategoryArchiveAction = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const { categoryId, action, categoryDetails } = req.body;

        if (!categoryId || !action || !categoryDetails) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        const actionType = action === 'ARCHIVE' ? 'ARCHIVE_CATEGORY' : 'UNARCHIVE_CATEGORY';
        const actionWord = action === 'ARCHIVE' ? 'archived' : 'unarchived';

        const log = await HistoryLog.create({
            userName: req.user.name,
            userEmail: req.user.email,
            userPosition: req.user.position,
            action: actionType,
            details: `${req.user.name} (${req.user.position}) ${actionWord} payment category: ${categoryDetails.name}`,
            metadata: {
                categoryId,
                categoryDetails,
                performedAt: new Date()
            },
            status: 'completed'
        });

        res.status(200).json({
            success: true,
            message: 'Category archive action logged successfully',
            log
        });
    } catch (error) {
        console.error('Error logging category archive action:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging category archive action',
            error: error.message
        });
    }
};

exports.logCategoryUpdate = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const { categoryId, previousData, newData } = req.body;

        if (!categoryId || !previousData || !newData) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        const changes = {};
        if (previousData.name !== newData.name) {
            changes.name = {
                from: previousData.name,
                to: newData.name
            };
        }
        if (previousData.totalPrice !== newData.totalPrice) {
            changes.totalPrice = {
                from: previousData.totalPrice,
                to: newData.totalPrice
            };
        }

        const log = await HistoryLog.create({
            userName: req.user.name,
            userEmail: req.user.email,
            userPosition: req.user.position,
            action: 'UPDATE_PAYMENT_CATEGORY',
            details: `${req.user.name} (${req.user.position}) updated payment category: ${newData.name}`,
            metadata: {
                categoryId,
                previousData,
                newData,
                changes,
                updatedAt: new Date()
            },
            status: 'completed'
        });

        res.status(200).json({
            success: true,
            message: 'Category update logged successfully',
            log
        });
    } catch (error) {
        console.error('Error logging category update:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging category update',
            error: error.message
        });
    }
};

exports.logDuesToggle = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const { userId, duesDetails } = req.body;

        if (!userId || !duesDetails) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        const log = await HistoryLog.create({
            userName: req.user.name,
            userEmail: req.user.email,
            userPosition: req.user.position,
            action: 'TOGGLE_DUES_PAYMENT',
            details: `${req.user.name} (${req.user.position}) changed dues payment status for ${duesDetails.day} of Week ${duesDetails.week}, ${duesDetails.month} from ${duesDetails.previousStatus} to ${duesDetails.newStatus}`,
            metadata: {
                userId,
                duesDetails,
                performedAt: new Date()
            },
            status: 'completed'
        });

        res.status(200).json({
            success: true,
            message: 'Dues payment toggle logged successfully',
            log
        });
    } catch (error) {
        console.error('Error logging dues toggle:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging dues toggle',
            error: error.message
        });
    }
};

exports.logDuesPayment = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const { userId, officerName, paymentDetails } = req.body;

        if (!userId || !officerName || !paymentDetails) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        const log = await HistoryLog.create({
            userName: req.user.name,
            userEmail: req.user.email,
            userPosition: req.user.position,
            action: 'DUES_PAYMENT',
            details: `${req.user.name} (${req.user.position}) processed dues payment for ${officerName}: ₱${paymentDetails.amount} for ${paymentDetails.daysCount} days in ${paymentDetails.month} Week ${paymentDetails.week}`,
            metadata: {
                userId,
                officerName,
                paymentDetails,
                processedAt: new Date()
            },
            status: 'completed'
        });

        res.status(200).json({
            success: true,
            message: 'Dues payment logged successfully',
            log
        });
    } catch (error) {
        console.error('Error logging dues payment:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging dues payment',
            error: error.message
        });
    }
}; 

exports.getRecentLogs = async (req, res) => {
    try {
        const recentLogs = await HistoryLog.find()
            .sort({ timestamp: -1 })
            .limit(5)
            .lean();

        const formattedLogs = recentLogs.map(log => ({
            _id: log._id,
            date: new Date(log.timestamp).toLocaleDateString(),
            time: new Date(log.timestamp).toLocaleTimeString(),
            user: log.userName,
            action: log.action,
            details: log.details
        }));

        res.status(200).json({
            success: true,
            logs: formattedLogs
        });
    } catch (error) {
        console.error('Error fetching recent logs:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching recent logs'
        });
    }
};