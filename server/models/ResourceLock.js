const mongoose = require('mongoose');

const ResourceLockSchema = new mongoose.Schema({
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
        enum: ['Edit', 'View', 'Delete'],
        required: true
    },
    lockedAt: {
        type: Date,
        default: Date.now
    }
});

// Create a TTL index that expires documents after 60 seconds
ResourceLockSchema.index({ lockedAt: 1 }, { expireAfterSeconds: 60 });

// Add index for faster queries
ResourceLockSchema.index({ resourceId: 1, lockType: 1, lockedAt: 1 });

module.exports = mongoose.model('ResourceLock', ResourceLockSchema);
