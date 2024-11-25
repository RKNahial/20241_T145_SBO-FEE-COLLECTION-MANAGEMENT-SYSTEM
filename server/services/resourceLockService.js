const ResourceLock = require('../models/ResourceLock');
const mongoose = require('mongoose');

class ResourceLockService {
    constructor() {
        this.LOCK_TIMEOUT = 60000; // 1 minute in milliseconds
    }

    async checkLock(resourceId, lockType) {
        try {
            // Input validation
            if (!resourceId) {
                throw new Error('Resource ID is required');
            }

            // Convert string ID to ObjectId
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
            
            if (!['Edit', 'View', 'Delete'].includes(normalizedLockType)) {
                return {
                    success: false,
                    message: `Invalid lock type: ${lockType}`
                };
            }

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

    async acquireLock(resourceId, userId, userName, lockType) {
        try {
            // Input validation with specific error messages
            if (!resourceId) {
                return {
                    success: false,
                    message: 'Resource ID is required'
                };
            }
            if (!userId) {
                return {
                    success: false,
                    message: 'User ID is required'
                };
            }
            if (!userName) {
                return {
                    success: false,
                    message: 'User name is required'
                };
            }
            if (!lockType) {
                return {
                    success: false,
                    message: 'Lock type is required'
                };
            }

            // Convert string IDs to ObjectIds with proper error handling
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

            // Normalize lockType
            const normalizedLockType = lockType.charAt(0).toUpperCase() + lockType.slice(1).toLowerCase();

            if (!['Edit', 'View', 'Delete'].includes(normalizedLockType)) {
                return {
                    success: false,
                    message: `Invalid lock type: ${lockType}`
                };
            }

            // Check for existing lock with proper error handling
            let existingLock;
            try {
                existingLock = await ResourceLock.findOne({ 
                    resourceId: resourceObjectId,
                    lockType: normalizedLockType,
                    userId: { $ne: userObjectId },
                    lockedAt: { $gt: new Date(Date.now() - this.LOCK_TIMEOUT) }
                }).exec();
            } catch (error) {
                console.error('Error checking existing lock:', error);
                return {
                    success: false,
                    message: 'Error checking lock status'
                };
            }
            
            if (existingLock) {
                return { 
                    success: false, 
                    message: `This student is currently being ${normalizedLockType.toLowerCase()}ed by ${existingLock.userName}` 
                };
            }

            // Clean up any existing locks by this user
            try {
                await ResourceLock.deleteMany({
                    resourceId: resourceObjectId,
                    userId: userObjectId,
                    lockType: normalizedLockType
                }).exec();
            } catch (error) {
                console.error('Error cleaning up existing locks:', error);
                return {
                    success: false,
                    message: 'Error cleaning up existing locks'
                };
            }

            // Create new lock with proper error handling
            let newLock;
            try {
                newLock = await ResourceLock.create({
                    resourceId: resourceObjectId,
                    userId: userObjectId,
                    userName: userName.toString(),
                    lockType: normalizedLockType,
                    lockedAt: new Date()
                });
            } catch (error) {
                console.error('Error creating new lock:', error);
                return {
                    success: false,
                    message: 'Error creating lock'
                };
            }

            return {
                success: true,
                message: `Lock acquired for ${normalizedLockType.toLowerCase()}ing`,
                lock: newLock
            };
        } catch (error) {
            console.error('Unexpected error in acquireLock:', error);
            return {
                success: false,
                message: 'An unexpected error occurred while acquiring lock'
            };
        }
    }

    async releaseLock(resourceId, userId, lockType) {
        try {
            if (!mongoose.Types.ObjectId.isValid(resourceId) || !mongoose.Types.ObjectId.isValid(userId)) {
                return {
                    success: false,
                    message: 'Invalid ID format'
                };
            }

            const normalizedLockType = lockType.charAt(0).toUpperCase() + lockType.slice(1).toLowerCase();
            
            await ResourceLock.deleteOne({
                resourceId: new mongoose.Types.ObjectId(resourceId),
                userId: new mongoose.Types.ObjectId(userId),
                lockType: normalizedLockType
            }).exec();

            return {
                success: true,
                message: 'Lock released successfully'
            };
        } catch (error) {
            console.error('Error in releaseLock:', error);
            return {
                success: false,
                message: 'Error releasing lock'
            };
        }
    }
}

module.exports = new ResourceLockService();