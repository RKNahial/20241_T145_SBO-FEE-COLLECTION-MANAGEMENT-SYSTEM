const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    userModel: {
        type: String,
        required: true,
        enum: ['Admin', 'Treasurer', 'Officer']
    },
    email: {
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true,
        default: 'login'
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