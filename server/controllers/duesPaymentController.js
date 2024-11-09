const DailyDues = require('../models/DailyDues');

exports.processDuesPayment = async (req, res) => {
    try {
        const { officerId, amount } = req.body;
        const daysCovered = Math.floor(amount / 5);
        
        // Get current date
        const today = new Date();
        const payments = [];

        // Create payment records for each day covered
        for (let i = 0; i < daysCovered; i++) {
            const payment = await DailyDues.findOneAndUpdate(
                { 
                    officerId,
                    status: 'Not Paid',
                    date: { $gte: today }
                },
                {
                    status: 'Paid',
                    amount: 5,
                    paymentDate: today
                },
                { new: true, sort: { date: 1 } }
            );
            if (payment) {
                payments.push(payment);
            }
        }

        res.status(200).json({
            success: true,
            message: `Payment processed for ${daysCovered} days`,
            payments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error processing payment',
            error: error.message
        });
    }
}; 