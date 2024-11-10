const DailyDues = require('../models/DailyDues');

exports.processDuesPayment = async (req, res) => {
    try {
        const { userId } = req.params;
        const { amount, userType, month, week } = req.body;
        
        if (!userId || !amount || !userType || !month || !week) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Find existing dues record
        let duesRecord = await DailyDues.findOne({
            userId,
            userType,
            month,
            week
        });

        if (!duesRecord) {
            return res.status(404).json({
                success: false,
                message: 'Dues record not found'
            });
        }

        // Calculate number of days that can be paid with the amount
        const daysCanBePaid = Math.floor(amount / 5);
        let daysUpdated = 0;

        // Update dues status
        const updatedDues = duesRecord.dues.map(due => {
            if (due.status === 'Unpaid' && daysUpdated < daysCanBePaid) {
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

        res.status(200).json({
            success: true,
            message: `Successfully paid ${daysUpdated} days`,
            data: duesRecord
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