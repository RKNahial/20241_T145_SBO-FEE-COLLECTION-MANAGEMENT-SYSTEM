const DailyDues = require('../models/DailyDues');
const Officer = require('../models/OfficerSchema');
const Treasurer = require('../models/TreasurerSchema');
const Governor = require('../models/GovernorSchema');

exports.getDailyDues = async (req, res) => {
    try {
        const { month, week } = req.query;
        
        // Get all users from different collections
        const officers = await Officer.find({}, 'name ID');
        const governors = await Governor.find({}, 'name ID');
        const treasurers = await Treasurer.find({}, 'name ID');

        // Combine all users with their types
        const allUsers = [
            ...officers.map(user => ({ ...user.toObject(), userType: 'Officer', officerName: user.name })),
            ...governors.map(user => ({ ...user.toObject(), userType: 'Governor', officerName: user.name })),
            ...treasurers.map(user => ({ ...user.toObject(), userType: 'Treasurer', officerName: user.name }))
        ];

        // Get dues records for all users
        const duesPromises = allUsers.map(async user => {
            let duesRecord = await DailyDues.findOne({
                userId: user._id,
                userType: user.userType,
                month,
                week
            });

            if (!duesRecord) {
                duesRecord = new DailyDues({
                    userId: user._id,
                    userType: user.userType,
                    month,
                    week,
                    dues: [
                        { day: 'Monday', status: 'Unpaid', amount: 0 },
                        { day: 'Tuesday', status: 'Unpaid', amount: 0 },
                        { day: 'Thursday', status: 'Unpaid', amount: 0 },
                        { day: 'Friday', status: 'Unpaid', amount: 0 }
                    ]
                });
            }

            return {
                userId: user._id,
                officerName: user.officerName,
                userType: user.userType,
                dues: duesRecord.dues
            };
        });

        // Wait for all promises to resolve
        const duesRecords = await Promise.all(duesPromises);

        res.json(duesRecords);
    } catch (error) {
        console.error('Error fetching dues:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching dues',
            error: error.message 
        });
    }
};

exports.updateDailyDues = async (req, res) => {
    try {
        const { userId } = req.params;
        const { amount, userType, month, week, daysCount } = req.body;
        
        // Find or create dues record
        let dues = await DailyDues.findOne({
            userId,
            userType,
            month,
            week
        }).populate('userId', 'name ID');

        if (!dues) {
            dues = new DailyDues({
                userId,
                userType,
                month,
                week,
                dues: [
                    { day: 'Monday', status: 'Unpaid', amount: 0 },
                    { day: 'Tuesday', status: 'Unpaid', amount: 0 },
                    { day: 'Thursday', status: 'Unpaid', amount: 0 },
                    { day: 'Friday', status: 'Unpaid', amount: 0 }
                ]
            });
        }

        let updatedCount = 0;
        const updatedDues = dues.dues.map(due => {
            if (due.status === 'Unpaid' && updatedCount < daysCount) {
                updatedCount++;
                return {
                    ...due,
                    status: 'Paid',
                    amount: 5,
                    paymentDate: new Date()
                };
            }
            return due;
        });

        dues.dues = updatedDues;
        await dues.save();

        // Return the updated record
        res.json({
            success: true,
            message: `Successfully paid ${updatedCount} days for ${month} Week ${week}`,
            data: dues
        });
    } catch (error) {
        console.error('Error updating dues:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error updating dues',
            error: error.message 
        });
    }
};

exports.toggleDuesStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { day, month, week, currentStatus, daysCount } = req.body;
        
        // Find the dues record
        let duesRecord = await DailyDues.findOne({
            userId,
            month,
            week
        });

        if (!duesRecord) {
            return res.status(404).json({
                success: false,
                message: 'Dues record not found'
            });
        }

        // Update the specific day's status
        const updatedDues = duesRecord.dues.map(due => {
            if (due.day === day) {
                return {
                    ...due,
                    status: currentStatus === 'Unpaid' ? 'Paid' : 'Unpaid',
                    amount: currentStatus === 'Unpaid' ? 5 : 0,
                    paymentDate: currentStatus === 'Unpaid' ? new Date() : null
                };
            }
            return due;
        });

        duesRecord.dues = updatedDues;
        await duesRecord.save();

        res.json({
            success: true,
            message: 'Status updated successfully',
            data: duesRecord
        });
    } catch (error) {
        console.error('Error toggling dues status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating dues status',
            error: error.message
        });
    }
}; 


exports.processDuesPayment = async (req, res) => {
    try {
        const { userId } = req.params;
        const { amount, userType, month, week, daysCount } = req.body;
        
        // Find or create dues record
        let duesRecord = await DailyDues.findOne({
            userId,
            userType,
            month,
            week
        }).populate('userId', 'name ID');

        if (!duesRecord) {
            duesRecord = new DailyDues({
                userId,
                userType,
                month,
                week,
                dues: [
                    { day: 'Monday', status: 'Unpaid', amount: 0 },
                    { day: 'Tuesday', status: 'Unpaid', amount: 0 },
                    { day: 'Thursday', status: 'Unpaid', amount: 0 },
                    { day: 'Friday', status: 'Unpaid', amount: 0 }
                ]
            });
        }

        let daysUpdated = 0;
        const updatedDues = duesRecord.dues.map(due => {
            if (due.status === 'Unpaid' && daysUpdated < daysCount) {
                daysUpdated++;
                return {
                    ...due,
                    status: 'Paid',
                    amount: 5,
                    paymentDate: new Date()
                };
            }
            return due;
        });

        duesRecord.dues = updatedDues;
        await duesRecord.save();

        // Fetch fresh data to ensure we have the latest state
        const updatedRecord = await DailyDues.findById(duesRecord._id)
            .populate('userId', 'name ID');

        res.status(200).json({
            success: true,
            message: `Successfully paid ${daysUpdated} days`,
            data: updatedRecord
        });
    } catch (error) {
        console.error('Payment processing error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process payment',
            error: error.message
        });
    }
};

exports.toggleDuesStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { day, month, week } = req.body;

        const duesRecord = await DailyDues.findOne({
            userId,
            month,
            week
        });

        if (!duesRecord) {
            return res.status(404).json({
                success: false,
                message: 'Dues record not found'
            });
        }

        // Find and toggle the status of the specified day
        const updatedDues = duesRecord.dues.map(due => {
            if (due.day === day) {
                return {
                    ...due,
                    status: due.status === 'Paid' ? 'Unpaid' : 'Paid',
                    amount: due.status === 'Paid' ? 0 : 5,
                    paymentDate: due.status === 'Paid' ? null : new Date()
                };
            }
            return due;
        });

        duesRecord.dues = updatedDues;
        await duesRecord.save();

        res.status(200).json({
            success: true,
            message: 'Status toggled successfully',
            data: duesRecord
        });
    } catch (error) {
        console.error('Toggle status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle status',
            error: error.message
        });
    }
}; 