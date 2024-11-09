const mongoose = require('mongoose');

const duesSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    userType: {
        type: String,
        enum: ['Officer', 'Treasurer', 'Governor'],
        required: true
    },
    name: {
        type: String,
        required: true
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
        date: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: ['Paid', 'Not Paid'],
            default: 'Not Paid'
        },
        amount: {
            type: Number,
            default: 0
        }
    }]
}, { timestamps: true });

module.exports = mongoose.model('DailyDues', duesSchema); 