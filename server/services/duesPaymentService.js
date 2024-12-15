const DailyDues = require('../models/DailyDues');

class DuesPaymentService {
    async findOrCreateDuesRecord(userId, userType, month, week) {
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

        return duesRecord;
    }

    async processPayment(duesRecord, daysCount) {
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

        const updatedRecord = await DailyDues.findById(duesRecord._id)
            .populate('userId', 'name ID');

        return { updatedRecord, daysUpdated };
    }
}

module.exports = new DuesPaymentService(); 