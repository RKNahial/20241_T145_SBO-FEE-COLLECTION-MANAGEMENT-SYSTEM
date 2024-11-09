const PaymentFee = require('../models/PaymentFee');
const Student = require('../models/studentSchema');

exports.updatePaymentStatus = async (req, res) => {
    try {
        const { studentId, categoryId, status, amount, transactionDetails } = req.body;
        
        const paymentFee = await PaymentFee.findOneAndUpdate(
            { studentId, categoryId },
            {
                status,
                amount,
                transactionDetails,
                paymentDate: status !== 'Not Paid' ? new Date() : null
            },
            { new: true, upsert: true }
        );

        // Update student's payment status
        await Student.findByIdAndUpdate(studentId, { paymentstatus: status });

        res.status(200).json({
            success: true,
            data: paymentFee
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getStudentPayments = async (req, res) => {
    try {
        const { studentId } = req.params;
        const payments = await PaymentFee.find({ studentId })
            .populate('categoryId')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: payments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}; 