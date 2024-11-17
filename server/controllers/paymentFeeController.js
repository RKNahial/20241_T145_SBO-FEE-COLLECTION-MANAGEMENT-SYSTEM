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



exports.getRecentPayments = async (req, res) => {
    try {
        const recentPayments = await PaymentFee.aggregate([
            {
                $match: {
                    status: { $in: ['Partially Paid', 'Fully Paid'] }
                }
            },
            {
                $lookup: {
                    from: 'students',
                    localField: 'studentId',
                    foreignField: '_id',
                    as: 'studentInfo'
                }
            },
            {
                $unwind: '$studentInfo'
            },
            {
                $lookup: {
                    from: 'paymentcategories',
                    localField: 'categoryId',
                    foreignField: '_id',
                    as: 'categoryInfo'
                }
            },
            {
                $unwind: '$categoryInfo'
            },
            {
                $sort: { 
                    paymentDate: -1 
                }
            },
            {
                $limit: 5
            },
            {
                $project: {
                    id: '$_id',
                    date: '$paymentDate',
                    categoryId: '$categoryInfo.categoryId',
                    studentId: '$studentInfo.studentId',
                    studentName: '$studentInfo.name',
                    paidAmount: '$amountPaid'
                }
            }
        ]);

        res.json({
            success: true,
            payments: recentPayments
        });
    } catch (error) {
        console.error('Error fetching recent payments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching recent payments',
            error: error.message
        });
    }
};

exports.getTotalFees = async (req, res) => {
    try {
        const totalFeesResult = await PaymentFee.aggregate([
            {
                $match: {
                    status: { $in: ['Partially Paid', 'Fully Paid'] }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amountPaid' }
                }
            }
        ]);

        const totalFees = totalFeesResult.length > 0 ? totalFeesResult[0].total : 0;

        return res.json({
            success: true,
            totalFees: totalFees
        });
    } catch (error) {
        console.error('Error calculating total fees:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to calculate total fees'
        });
    }
};

exports.getPaymentsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const payments = await PaymentFee.find({ categoryId })
            .populate('studentId', 'studentId name')
            .populate('categoryId', 'categoryId')
            .sort({ paymentDate: -1 });

        res.json({
            success: true,
            payments
        });
    } catch (error) {
        console.error('Error fetching payments by category:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payments by category',
            error: error.message
        });
    }
};


exports.getPaymentReports = async (req, res) => {
    try {
        const now = new Date();
        const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
        const sixMonthsAgo = new Date(now - 180 * 24 * 60 * 60 * 1000);
        const oneYearAgo = new Date(now - 365 * 24 * 60 * 60 * 1000);

        const periods = [
            { label: '1 Week', startDate: oneWeekAgo },
            { label: '1 Month', startDate: oneMonthAgo },
            { label: '6 Months', startDate: sixMonthsAgo },
            { label: '1 Year', startDate: oneYearAgo }
        ];

        const reports = await Promise.all(periods.map(async period => {
            const total = await PaymentFee.aggregate([
                {
                    $match: {
                        updatedAt: { $gte: period.startDate },
                        status: { $in: ['Partially Paid', 'Fully Paid'] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$amountPaid' }
                    }
                }
            ]);

            return {
                period: period.label,
                total: total.length > 0 ? total[0].total : 0
            };
        }));

        res.json({
            success: true,
            data: reports
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating payment reports',
            error: error.message
        });
    }
};

exports.getPaymentsByProgram = async (req, res) => {
    try {
        const { year, month } = req.query;
        const activeCategories = await PaymentCategory.find({ isArchived: false });
        
        // Create date range filter
        let dateFilter = {};
        if (year && month) {
            const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
            const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
            dateFilter = {
                'transactions.date': {
                    $gte: startDate,
                    $lte: endDate
                }
            };
        } else if (year) {
            const startDate = new Date(parseInt(year), 0, 1);
            const endDate = new Date(parseInt(year), 11, 31, 23, 59, 59, 999);
            dateFilter = {
                'transactions.date': {
                    $gte: startDate,
                    $lte: endDate
                }
            };
        }

        const categoryPayments = await Promise.all(activeCategories.map(async category => {
            const payments = await PaymentFee.aggregate([
                {
                    $match: {
                        categoryId: category._id,
                        status: { $in: ['Partially Paid', 'Fully Paid'] },
                        ...dateFilter
                    }
                },
                {
                    $unwind: '$transactions'
                },
                {
                    $match: {
                        'transactions.type': 'Payment',
                        ...dateFilter
                    }
                },
                {
                    $group: {
                        _id: category._id,
                        total: { $sum: '$transactions.amount' }
                    }
                }
            ]);

            return {
                category: category.name,
                total: payments.length > 0 ? payments[0].total : 0
            };
        }));

        res.json({
            success: true,
            data: categoryPayments,
            period: year && month ? `${getMonthName(month)} ${year}` : year ? `Year ${year}` : 'All Time'
        });
    } catch (error) {
        console.error('Error in getPaymentsByProgram:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating category payment reports',
            error: error.message
        });
    }
};

function getMonthName(month) {
    return new Date(0, parseInt(month) - 1).toLocaleString('en-US', { month: 'long' });
}

