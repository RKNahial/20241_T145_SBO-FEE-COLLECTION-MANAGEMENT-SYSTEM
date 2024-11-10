const mongoose = require('mongoose');

const dailyDuesSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'userType',
        required: true
    },
    userType: {
        type: String,
        required: true,
        enum: ['Officer', 'Treasurer', 'Governor']
    },
    month: {
        type: String,
        required: true
    },
    week: {
        type: String,
        required: true
    },
    dues: [{
        day: String,
        status: {
            type: String,
            enum: ['Paid', 'Unpaid', 'Not Paid'],
            default: 'Unpaid'
        },
        amount: {
            type: Number,
            default: 0
        },
        paymentDate: {
            type: Date
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('DailyDues', dailyDuesSchema); 