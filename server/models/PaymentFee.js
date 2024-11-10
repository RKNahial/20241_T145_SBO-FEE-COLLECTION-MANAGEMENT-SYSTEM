const mongoose = require('mongoose');

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
    }
}, { timestamps: true });

module.exports = mongoose.model('PaymentFee', paymentFeeSchema); 