const PaymentFee = require('../models/PaymentFee');
const Student = require('../models/studentSchema');
const PaymentCategory = require('../models/PaymentCategory');

exports.updatePaymentStatus = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { 
            status, 
            amountPaid, 
            paymentCategory,
            paymentDate,
            totalPrice 
        } = req.body;

        // Find the payment category
        const category = await PaymentCategory.findOne({ name: paymentCategory });
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Payment category not found'
            });
        }

        // Find or create payment record
        let paymentFee = await PaymentFee.findOne({
            studentId,
            categoryId: category._id
        });

        if (!paymentFee) {
            paymentFee = new PaymentFee({
                studentId,
                categoryId: category._id,
                paymentCategory,
                totalPrice
            });
        }

        // Update payment details
        paymentFee.status = status;
        paymentFee.amountPaid = status === 'Not Paid' ? 0 : amountPaid;
        paymentFee.paymentDate = status !== 'Not Paid' ? new Date(paymentDate) : null;
        paymentFee.totalPrice = totalPrice;

        await paymentFee.save();

        // Update student's overall payment status
        await Student.findByIdAndUpdate(studentId, {
            paymentstatus: status
        });

        res.status(200).json({
            success: true,
            message: 'Payment status updated successfully',
            data: paymentFee
        });

    } catch (error) {
        console.error('Payment update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update payment status',
            error: error.message
        });
    }
};

exports.getStudentPayments = async (req, res) => {
    try {
        const { studentId } = req.params;
        const payments = await PaymentFee.find({ studentId })
            .populate('categoryId')
            .sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            data: payments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payment history',
            error: error.message
        });
    }
}; 