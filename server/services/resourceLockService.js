const ResourceLock = require('../models/ResourceLock');
const mongoose = require('mongoose');

class ResourceLockService {
    constructor() {
        this.LOCK_TIMEOUT = 60000; // 60 seconds to match MongoDB TTL
    }

    async acquireLock(resourceId, userId, userName, lockType) {
        try {
            if (!resourceId || !userId || !userName || !lockType) {
                return {
                    success: false,
                    message: 'Missing required parameters'
                };
            }

            let resourceObjectId, userObjectId;
            try {
                resourceObjectId = mongoose.Types.ObjectId.isValid(resourceId) 
                    ? new mongoose.Types.ObjectId(resourceId)
                    : null;
                userObjectId = mongoose.Types.ObjectId.isValid(userId)
                    ? new mongoose.Types.ObjectId(userId)
                    : null;

                if (!resourceObjectId || !userObjectId) {
                    return {
                        success: false,
                        message: 'Invalid ID format provided'
                    };
                }
            } catch (error) {
                console.error('ObjectId conversion error:', error);
                return {
                    success: false,
                    message: 'Invalid ID format'
                };
            }

            const normalizedLockType = lockType.charAt(0).toUpperCase() + lockType.slice(1).toLowerCase();

            // Clean up expired locks first
            await this.cleanExpiredLocks();

            // Check for existing non-expired lock
            const existingLock = await ResourceLock.findOne({ 
                resourceId: resourceObjectId,
                lockType: normalizedLockType,
                lockedAt: { $gt: new Date(Date.now() - this.LOCK_TIMEOUT) }
            });

            // If there's an existing valid lock by another user
            if (existingLock && existingLock.userId.toString() !== userObjectId.toString()) {
                return { 
                    success: false, 
                    message: `This student is currently being ${normalizedLockType.toLowerCase()}ed by ${existingLock.userName}` 
                };
            }

            try {
                // Create new lock with upsert
                const newLock = await ResourceLock.findOneAndUpdate(
                    {
                        resourceId: resourceObjectId,
                        lockType: normalizedLockType
                    },
                    {
                        $set: {
                            userId: userObjectId,
                            userName: userName.toString(),
                            lockedAt: new Date()
                        }
                    },
                    {
                        upsert: true,
                        new: true
                    }
                );

                return {
                    success: true,
                    message: `Lock acquired for ${normalizedLockType.toLowerCase()}ing`,
                    lock: newLock
                };
            } catch (error) {
                if (error.code === 11000) { // Duplicate key error
                    return {
                        success: false,
                        message: 'Lock already exists'
                    };
                }
                throw error;
            }
        } catch (error) {
            console.error('Error in acquireLock:', error);
            return {
                success: false,
                message: 'Error acquiring lock',
                error: error.message
            };
        }
    }

    async releaseLock(resourceId, userId, lockType) {
        try {
            console.log('ReleaseLock Service Called:', { resourceId, userId, lockType });

            if (!mongoose.Types.ObjectId.isValid(resourceId)) {
                console.error('Invalid resourceId format:', resourceId);
                return {
                    success: false,
                    message: 'Invalid resource ID format'
                };
            }

            const normalizedLockType = lockType.charAt(0).toUpperCase() + lockType.slice(1).toLowerCase();
            
            // Clean up expired locks first
            await this.cleanExpiredLocks();

            // Delete the specific lock
            const deleteResult = await ResourceLock.deleteMany({
                resourceId: new mongoose.Types.ObjectId(resourceId),
                lockType: normalizedLockType
            });

            console.log('Delete Result:', deleteResult);

            return {
                success: true,
                message: 'Lock released successfully',
                deleteCount: deleteResult.deletedCount
            };
        } catch (error) {
            console.error('Error in releaseLock:', error);
            return {
                success: false,
                message: 'Error releasing lock',
                error: error.message
            };
        }
    }

    async cleanExpiredLocks() {
        try {
            const expiryTime = new Date(Date.now() - this.LOCK_TIMEOUT);
            const result = await ResourceLock.deleteMany({
                lockedAt: { $lt: expiryTime }
            });
            console.log(`Cleaned ${result.deletedCount} expired locks`);
        } catch (error) {
            console.error('Error cleaning expired locks:', error);
        }
    }

    async cleanAllLocksForUser(userId) {
        try {
            if (!userId) {
                throw new Error('User ID is required');
            }

            const result = await ResourceLock.deleteMany({
                userId: new mongoose.Types.ObjectId(userId)
            });

            console.log(`Cleaned ${result.deletedCount} locks for user ${userId}`);
            return {
                success: true,
                message: 'All locks cleaned successfully',
                deletedCount: result.deletedCount
            };
        } catch (error) {
            console.error('Error cleaning user locks:', error);
            return {
                success: false,
                message: 'Error cleaning user locks',
                error: error.message
            };
        }
    }

    async checkLock(resourceId, lockType) {
        try {
            if (!resourceId) {
                throw new Error('Resource ID is required');
            }

            let resourceObjectId;
            try {
                resourceObjectId = mongoose.Types.ObjectId.isValid(resourceId) 
                    ? new mongoose.Types.ObjectId(resourceId)
                    : null;

                if (!resourceObjectId) {
                    return {
                        success: false,
                        message: 'Invalid ID format provided'
                    };
                }
            } catch (error) {
                console.error('ObjectId conversion error:', error);
                return {
                    success: false,
                    message: 'Invalid ID format'
                };
            }

            const normalizedLockType = lockType.charAt(0).toUpperCase() + lockType.slice(1).toLowerCase();
            
            // Clean up expired locks first
            await this.cleanExpiredLocks();

            // Check for non-expired lock
            const existingLock = await ResourceLock.findOne({ 
                resourceId: resourceObjectId,
                lockType: normalizedLockType,
                lockedAt: { $gt: new Date(Date.now() - this.LOCK_TIMEOUT) }
            });

            if (!existingLock) {
                return { success: true };
            }

            return { 
                success: false,
                userName: existingLock.userName
            };
        } catch (error) {
            console.error('Error in checkLock:', error);
            throw error;
        }
    }
}

module.exports = new ResourceLockService();