const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    type: {
        type: String,
        enum: ['Payment', 'Refund'],
        required: true
    },
    previousStatus: String,
    newStatus: String
});

const paymentFeeSchema = new mongoose.Schema({
    studentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Student', 
        required: true 
    },
    categoryId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'PaymentCategory', 
        required: true 
    },
    paymentCategory: {
        type: String,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    amountPaid: { 
        type: Number,
        default: 0
    },
    status: { 
        type: String, 
        enum: ['Not Paid', 'Partially Paid', 'Fully Paid', 'Refunded'],
        default: 'Not Paid'
    },
    paymentDate: {
        type: Date
    },
    transactions: [transactionSchema]
});

module.exports = mongoose.model('PaymentFee', paymentFeeSchema); 