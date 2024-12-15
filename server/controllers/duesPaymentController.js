const duesPaymentService = require('../services/duesPaymentService');

exports.processDuesPayment = async (req, res) => {
    try {
        const { userId } = req.params;
        const { amount, userType, month, week, daysCount } = req.body;
        
        const duesRecord = await duesPaymentService.findOrCreateDuesRecord(
            userId,
            userType,
            month,
            week
        );

        const { updatedRecord, daysUpdated } = await duesPaymentService.processPayment(
            duesRecord,
            daysCount
        );

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