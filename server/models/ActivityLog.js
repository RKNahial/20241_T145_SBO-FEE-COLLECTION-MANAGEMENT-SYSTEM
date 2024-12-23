const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    userPosition: {
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true
    },
    details: {
        type: String,
        required: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    previousData: {
        type: Object
    },
    newData: {
        type: Object
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['active', 'completed'],
        default: 'completed'
    },
    ipAddress: String
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema); 