const DailyDues = require('../models/DailyDues');
const Officer = require('../models/OfficerSchema');
const Treasurer = require('../models/TreasurerSchema');
const Governor = require('../models/GovernorSchema');

class DailyDuesService {
    async getAllUsers() {
        const [officers, governors, treasurers] = await Promise.all([
            Officer.find({ isArchived: false }, 'name ID'),
            Governor.find({ isArchived: false }, 'name ID'),
            Treasurer.find({ isArchived: false }, 'name ID')
        ]);

        return [
            ...officers.map(user => ({ ...user.toObject(), userType: 'Officer', officerName: user.name })),
            ...governors.map(user => ({ ...user.toObject(), userType: 'Governor', officerName: user.name })),
            ...treasurers.map(user => ({ ...user.toObject(), userType: 'Treasurer', officerName: user.name }))
        ];
    }

    async getDuesRecord(userId, userType, month, week) {
        let record = await DailyDues.findOne({
            userId,
            userType,
            month,
            week
        }).populate('userId', 'name ID');

        if (!record) {
            record = new DailyDues({
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

        return record;
    }

    async updateDuesPayment(userId, userType, month, week, daysCount) {
        const record = await this.getDuesRecord(userId, userType, month, week);
        let updatedCount = 0;

        record.dues = record.dues.map(due => {
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

        await record.save();
        return { record, updatedCount };
    }

    async toggleDuesStatus(userId, day, month, week) {
        // First find the user to get their userType
        const [officer, governor, treasurer] = await Promise.all([
            Officer.findById(userId),
            Governor.findById(userId),
            Treasurer.findById(userId)
        ]);

        const user = officer || governor || treasurer;
        if (!user) {
            throw new Error('User not found');
        }

        const userType = officer ? 'Officer' : governor ? 'Governor' : 'Treasurer';
        let record = await DailyDues.findOne({ userId, month, week, userType });
        
        if (!record) {
            record = new DailyDues({
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

        record.dues = record.dues.map(due => {
            if (due.day === day) {
                const newStatus = due.status === 'Paid' ? 'Unpaid' : 'Paid';
                return {
                    ...due,
                    status: newStatus,
                    amount: newStatus === 'Paid' ? 5 : 0,
                    paymentDate: newStatus === 'Paid' ? new Date() : null
                };
            }
            return due;
        });

        await record.save();
        return record;
    }
}

module.exports = new DailyDuesService(); 