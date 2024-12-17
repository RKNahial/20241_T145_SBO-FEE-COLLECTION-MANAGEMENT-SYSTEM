const PaymentFee = require('../models/PaymentFee');
const Student = require('../models/studentSchema');
const PaymentCategory = require('../models/PaymentCategory');
const HistoryLog = require('../models/HistoryLog');
const moment = require('moment-timezone');
const resourceLockService = require('../services/resourceLockService'); // Assuming this service is defined elsewhere

exports.updatePaymentStatus = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { status, amountPaid, paymentCategory, paymentDate, totalPrice } = req.body;

        // Find the student
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // Find the payment category
        const category = await PaymentCategory.findById(paymentCategory);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Payment category not found' });
        }

        // Find or create payment record
        let paymentFee = await PaymentFee.findOne({
            studentId,
            categoryId: category._id
        });

        const previousStatus = paymentFee ? paymentFee.status : 'Not Paid';
        const previousAmount = paymentFee ? paymentFee.amountPaid : 0;

        if (!paymentFee) {
            paymentFee = new PaymentFee({
                studentId,
                categoryId: category._id,
                paymentCategory,
                totalPrice,
                transactions: []
            });
        }

        // Record the transaction and update payment details
        const transactionAmount = status === 'Not Paid' ? 0 : parseFloat(amountPaid);
        paymentFee.transactions.push({
            amount: transactionAmount,
            date: new Date(paymentDate),
            type: 'Payment',
            previousStatus,
            newStatus: status
        });
     
        paymentFee.status = status;
        paymentFee.amountPaid = transactionAmount;
        paymentFee.paymentDate = status !== 'Not Paid' ? new Date(paymentDate) : null;
        paymentFee.totalPrice = parseFloat(totalPrice);
     
        await paymentFee.save();

        // Create history log
        await HistoryLog.create({
            userName: req.user.name,
            userEmail: req.user.email,
            userPosition: req.user.position,
            action: 'PAYMENT_UPDATE',
            details: `${req.user.name} (${req.user.position}) updated payment for student: ${student.name}`,
            metadata: {
                studentId,
                studentName: student.name,
                paymentCategory,
                previousStatus,
                newStatus: status,
                previousAmount,
                newAmount: transactionAmount,
                totalPrice,
                paymentDate
            }
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
        const { category } = req.query;
        
        // Find payment record for the student and specific category
        const paymentFee = await PaymentFee.findOne({ 
            studentId,
            categoryId: category 
        })
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
                    categoryName: '$categoryInfo.name',
                    studentId: '$studentInfo.studentId',
                    studentName: '$studentInfo.name',
                    paidAmount: '$amountPaid',
                    paymentTime: {
                        $dateToString: {
                            format: "%Y-%m-%dT%H:%M:%S.%LZ", 
                            date: '$paymentDate'
                        }
                    }
                }
            }
        ]);

        // Adjust the payment times to Philippine Time (UTC+8) and format date as hh:mm A
        recentPayments.forEach(payment => {
            if (payment.paymentTime) {
                const utcDate = moment(payment.paymentTime); 
                payment.paymentTime = utcDate.tz('Asia/Manila').format('hh:mm A'); 
            }
        });

        res.json({
            success: true,
            payments: recentPayments
        });
    } catch (error) {
        console.error('Error fetching recent payments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching recent payments',
            error: error.message,
            stack: error.stack // Log the stack trace for more details
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
        const currentYear = new Date().getFullYear();
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        const reports = await Promise.all(months.map(async (month, monthIndex) => {
            // Get all payments for the month
            const startOfMonth = new Date(currentYear, monthIndex, 1);
            const endOfMonth = new Date(currentYear, monthIndex + 1, 0);
            
            // Get all payments for the month
            const monthlyPayments = await PaymentFee.aggregate([
                {
                    $match: {
                        paymentDate: { 
                            $gte: startOfMonth, 
                            $lte: endOfMonth 
                        },
                        status: { $in: ['Partially Paid', 'Fully Paid'] }
                    }
                }
            ]);

            // Calculate weeks based on actual payment dates
            const weeklyTotals = Array(4).fill(0);
            monthlyPayments.forEach(payment => {
                const dayOfMonth = new Date(payment.paymentDate).getDate();
                const weekIndex = Math.min(Math.floor((dayOfMonth - 1) / 7), 3);
                weeklyTotals[weekIndex] += payment.amountPaid || 0;
            });

            const weeksInMonth = weeklyTotals.map((total, index) => ({
                week: `Week ${index + 1}`,
                total: total
            }));

            return {
                month,
                weeks: weeksInMonth
            };
        }));

        res.json({
            success: true,
            data: reports
        });
    } catch (error) {
        console.error('Error generating payment reports:', error);
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

exports.getPaymentsByProgramTotal = async (req, res) => {
    try {
        const programTotals = await PaymentFee.aggregate([
            {
                $lookup: {
                    from: 'students',
                    localField: 'studentId',
                    foreignField: '_id',
                    as: 'student'
                }
            },
            {
                $unwind: '$student'
            },
            {
                $match: {
                    status: { $in: ['Partially Paid', 'Fully Paid'] }
                }
            },
            {
                $group: {
                    _id: '$student.program',
                    total: { $sum: '$amountPaid' }
                }
            },
            {
                $project: {
                    program: '$_id',
                    total: 1,
                    _id: 0
                }
            }
        ]);

        res.json({
            success: true,
            data: programTotals
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating program payment reports',
            error: error.message
        });
    }
};

function getMonthName(month) {
    return new Date(0, parseInt(month) - 1).toLocaleString('en-US', { month: 'long' });
}

exports.checkLock = async (req, res) => {
    try {
        const { id, lockType } = req.params;
        
        if (!['Edit', 'View', 'Delete'].includes(lockType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid lock type'
            });
        }

        const lockStatus = await resourceLockService.checkLock(id, lockType);
        res.json(lockStatus);
    } catch (error) {
        console.error('Error checking lock:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error checking lock status' 
        });
    }
};

exports.acquireLock = async (req, res) => {
    try {
        const { id } = req.params;
        const { lockType } = req.body;
        
        // Validate user authentication
        if (!req.user || !req.user._id || !req.user.name) {
            return res.status(401).json({
                success: false,
                message: 'User authentication required'
            });
        }

        // Validate lock type
        const validLockTypes = ['Edit', 'View', 'Delete'];
        if (!validLockTypes.includes(lockType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid lock type'
            });
        }

        const lockResult = await resourceLockService.acquireLock(
            id,
            req.user._id,
            req.user.name,
            lockType
        );

        if (!lockResult.success) {
            return res.status(409).json(lockResult); // 409 Conflict
        }

        res.json(lockResult);
    } catch (error) {
        console.error('Error in acquireLock controller:', error);
        
        if (error.message.includes('Invalid resource ID') ||
            error.message.includes('Invalid user ID') ||
            error.message.includes('Invalid lock type')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error while acquiring lock'
        });
    }
};

exports.releaseLock = async (req, res) => {
    try {
        const { id } = req.params;
        const { lockType } = req.params;
        const { userId } = req.body;

        if (!id || !lockType) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameters: id or lockType'
            });
        }

        // If userId is not in body, try to get it from auth user
        const effectiveUserId = userId || (req.user && req.user._id);
        
        if (!effectiveUserId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        const result = await resourceLockService.releaseLock(id, effectiveUserId, lockType);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json({
            success: true,
            message: 'Lock released successfully'
        });
    } catch (error) {
        console.error('Error in releaseLock controller:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while releasing lock',
            error: error.message
        });
    }
};
