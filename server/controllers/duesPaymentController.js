const DailyDues = require('../models/DailyDues');

exports.processDuesPayment = async (req, res) => {
    try {
        const { userId } = req.params;
        const { amount, userType, month, week } = req.body;
        const daysCovered = Math.floor(amount / 5);

        // Find the dues record
        let dues = await DailyDues.findOne({
            userId,
            userType,
            month,
            week
        });

        if (!dues) {
            return res.status(404).json({
                success: false,
                message: 'Dues record not found'
            });
        }

        // Count unpaid dues
        let unpaidDues = dues.dues.filter(due => due.status === 'Unpaid');
        
        if (unpaidDues.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No unpaid dues found for this period'
            });
        }

        // Update dues status based on amount paid
        let updatedCount = 0;
        for (let i = 0; i < dues.dues.length && updatedCount < daysCovered; i++) {
            if (dues.dues[i].status === 'Unpaid') {
                dues.dues[i].status = 'Paid';
                dues.dues[i].amount = 5;
                dues.dues[i].paymentDate = new Date();
                updatedCount++;
            }
        }

        await dues.save();

        res.status(200).json({
            success: true,
            message: `Successfully paid ${updatedCount} days for ${month} Week ${week}`,
            dues,
            daysUpdated: updatedCount
        });
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing payment',
            error: error.message
        });
    }
}; 