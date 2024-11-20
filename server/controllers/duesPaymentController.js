const DailyDues = require('../models/DailyDues');

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