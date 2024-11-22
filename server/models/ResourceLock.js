const mongoose = require('mongoose');

const resourceLockSchema = new mongoose.Schema({
    resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Student'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    lockType: {
        type: String,
        enum: ['EDIT', 'ARCHIVE'],
        required: true
    },
    lockedAt: {
        type: Date,
        default: Date.now,
        expires: 20 // Lock expires after 20 seconds
    }
});

module.exports = mongoose.model('ResourceLock', resourceLockSchema);