const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    userModel: {
        type: String,
        required: true,
        enum: ['admin','Admin', 'Treasurer', 'Officer', 'Governor']
    },
    action: {
        type: String,
        required: true,
        enum: ['login', 'logout']
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    },
    details: {
        type: Object,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['active', 'completed'],
        default: 'active'
    }
}, {
    toJSON: { getters: true },
    toObject: { getters: true }
});

module.exports = mongoose.model('Log', logSchema); 