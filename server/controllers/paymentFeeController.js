const PaymentFee = require('../models/PaymentFee');
const Student = require('../models/studentSchema');
const PaymentCategory = require('../models/PaymentCategory');

exports.updatePaymentStatus = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { status, amountPaid, paymentCategory, paymentDate, totalPrice } = req.body;

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
                totalPrice,
                transactions: []
            });
        }

        // Record the transaction
        const previousStatus = paymentFee.status;
        const transactionAmount = status === 'Not Paid' ? 0 : parseFloat(amountPaid);

        paymentFee.transactions.push({
            amount: transactionAmount,
            date: new Date(paymentDate),
            type: 'Payment',
            previousStatus,
            newStatus: status
        });

        // Update payment details
        paymentFee.status = status;
        paymentFee.amountPaid = transactionAmount;
        paymentFee.paymentDate = status !== 'Not Paid' ? new Date(paymentDate) : null;
        paymentFee.totalPrice = parseFloat(totalPrice);

        await paymentFee.save();

        // Update student's overall payment status
        await Student.findByIdAndUpdate(studentId, {
            paymentstatus: status
        });

        res.json({
            success: true,
            message: 'Payment updated successfully',
            paymentFee
        });
    } catch (error) {
        console.error('Error updating payment:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating payment',
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

exports.getPaymentDetails = async (req, res) => {
    try {
        const { studentId } = req.params;
        
        // Find all payment records for the student
        const paymentFee = await PaymentFee.findOne({ studentId })
            .populate('categoryId')
            .sort({ 'paymentDate': -1 });

        if (!paymentFee) {
            return res.json({
                success: true,
                paymentFee: {
                    paymentCategory: 'N/A',
                    totalPrice: 0,
                    amountPaid: 0,
                    status: 'Not Paid',
                    transactions: []
                }
            });
        }

        res.json({
            success: true,
            paymentFee: {
                paymentCategory: paymentFee.paymentCategory,
                totalPrice: paymentFee.totalPrice,
                amountPaid: paymentFee.amountPaid,
                status: paymentFee.status,
                transactions: paymentFee.transactions.map(t => ({
                    ...t.toObject(),
                    formattedDate: new Date(t.date).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                })).sort((a, b) => b.date - a.date)
            }
        });
    } catch (error) {
        console.error('Error fetching payment details:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payment details',
            error: error.message
        });
    }
}; 