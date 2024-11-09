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
    amount: { 
        type: Number, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['Not Paid', 'Partially Paid', 'Fully Paid', 'Refunded'],
        default: 'Not Paid'
    },
    paymentDate: { 
        type: Date 
    },
    transactionDetails: { 
        type: String 
    }
}, { timestamps: true });

module.exports = mongoose.model('PaymentFee', paymentFeeSchema); 