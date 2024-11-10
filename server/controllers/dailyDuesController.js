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