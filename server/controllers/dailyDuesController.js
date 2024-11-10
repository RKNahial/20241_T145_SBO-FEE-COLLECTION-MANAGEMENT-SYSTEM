const DailyDues = require('../models/DailyDues');
const Officer = require('../models/OfficerSchema');
const Treasurer = require('../models/TreasurerSchema');
const Governor = require('../models/GovernorSchema');
const axios = require('axios');
exports.getDailyDues = async (req, res) => {
    try {
        const { month, week } = req.query;
        
        // Get all users from different roles with explicit field selection
        const [officers, treasurers, governors] = await Promise.all([
            Officer.find({}, 'name ID position').lean(),
            Treasurer.find({}, 'name ID position').lean(),
            Governor.find({}, 'name ID position').lean()
        ]);

        // Debug log to check retrieved data
        console.log('Retrieved users:', { officers, treasurers, governors });

        // Combine all users with their roles
        const allUsers = [
            ...officers.map(user => ({ ...user, userType: 'Officer' })),
            ...treasurers.map(user => ({ ...user, userType: 'Treasurer' })),
            ...governors.map(user => ({ ...user, userType: 'Governor' }))
        ];

        // Get or create dues records for each user
        const duesPromises = allUsers.map(async (user) => {
            let dues = await DailyDues.findOne({
                userId: user._id,
                userType: user.userType,
                month,
                week
            });

            if (!dues) {
                dues = await DailyDues.create({
                    userId: user._id,
                    userType: user.userType,
                    name: user.name || user.ID, // Fallback to ID if name is not present
                    month,
                    week,
                    dues: [
                        { date: 1, status: 'Unpaid' },
                        { date: 2, status: 'Unpaid' },
                        { date: 4, status: 'Unpaid' },
                        { date: 5, status: 'Unpaid' }
                    ]
                });
            }

            return {
                userId: user._id,
                userType: user.userType,
                officerName: user.name || user.ID, // Ensure we're sending either name or ID
                dues: dues.dues
            };
        });

        const duesRecords = await Promise.all(duesPromises);
        console.log('Sending dues records:', duesRecords); // Debug log
        res.json(duesRecords);
    } catch (error) {
        console.error('Error fetching daily dues:', error);
        res.status(500).json({ message: 'Error fetching daily dues', error: error.message });
    }
};

exports.updateDailyDues = async (req, res) => {
    try {
        const { userId } = req.params;
        const { amount, userType, month, week } = req.body;
        const daysCount = Math.floor(amount / 5);

        // Find or create dues record
        let dues = await DailyDues.findOne({ 
            userId, 
            userType,
            month,
            week
        });

        // If no dues record exists for this period, create one
        if (!dues) {
            let user;
            switch (userType) {
                case 'Officer':
                    user = await Officer.findById(userId);
                    break;
                case 'Treasurer':
                    user = await Treasurer.findById(userId);
                    break;
                case 'Governor':
                    user = await Governor.findById(userId);
                    break;
            }

            dues = await DailyDues.create({
                userId,
                userType,
                name: user?.name || user?.ID || userType,
                month,
                week,
                dues: [
                    { date: 1, status: 'Unpaid' },
                    { date: 2, status: 'Unpaid' },
                    { date: 4, status: 'Unpaid' },
                    { date: 5, status: 'Unpaid' }
                ]
            });
        }

        // Find the next available week if current week is fully paid
        let currentWeek = parseInt(week);
        let currentMonth = month;
        let unpaidDues = dues.dues.filter(due => due.status === 'Unpaid');
        
        while (unpaidDues.length === 0 && daysCount > 0) {
            currentWeek++;
            if (currentWeek > 4) {
                currentWeek = 1;
                // Get next month
                const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                              'July', 'August', 'September', 'October', 'November', 'December'];
                const currentMonthIndex = months.indexOf(currentMonth);
                currentMonth = months[(currentMonthIndex + 1) % 12];
            }

            // Look for or create dues for the next period
            dues = await DailyDues.findOne({
                userId,
                userType,
                month: currentMonth,
                week: currentWeek.toString()
            });

            if (!dues) {
                dues = await DailyDues.create({
                    userId,
                    userType,
                    name: user?.name || user?.ID || userType,
                    month: currentMonth,
                    week: currentWeek.toString(),
                    dues: [
                        { date: 1, status: 'Unpaid' },
                        { date: 2, status: 'Unpaid' },
                        { date: 4, status: 'Unpaid' },
                        { date: 5, status: 'Unpaid' }
                    ]
                });
            }

            unpaidDues = dues.dues.filter(due => due.status === 'Unpaid');
        }

        if (unpaidDues.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No unpaid dues found for the specified period and future periods'
            });
        }

        // Update dues status based on amount paid
        let updatedCount = 0;
        for (let i = 0; i < dues.dues.length && updatedCount < daysCount; i++) {
            if (dues.dues[i].status === 'Unpaid') {
                dues.dues[i].status = 'Paid';
                dues.dues[i].amount = 5;
                dues.dues[i].paymentDate = new Date();
                updatedCount++;
            }
        }

        await dues.save();

        res.json({ 
            success: true,
            message: `Successfully paid ${updatedCount} days for ${currentMonth} Week ${currentWeek}`,
            dues,
            daysUpdated: updatedCount,
            month: currentMonth,
            week: currentWeek
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