const ResourceLock = require('../models/ResourceLock');

class ResourceLockService {
    constructor() {
        this.LOCK_TIMEOUT = 60000; // 1 minute in milliseconds
    }

    async acquireLock(resourceId, userId, userName, lockType) {
        try {
            const existingLock = await ResourceLock.findOne({ 
                resourceId,
                lockType,
                userId: { $ne: userId },
                lockedAt: { $gt: new Date(Date.now() - this.LOCK_TIMEOUT) }
            });
            
            if (existingLock) {
                return { 
                    success: false, 
                    message: `This student is currently being ${lockType.toLowerCase()}ed by ${existingLock.userName}` 
                };
            }

            await ResourceLock.deleteOne({
                resourceId,
                userId,
                lockType
            });

            const newLock = await ResourceLock.create({
                resourceId,
                userId,
                userName,
                lockType,
                lockedAt: new Date()
            });

            setTimeout(async () => {
                await this.releaseLock(resourceId, userId, lockType);
            }, this.LOCK_TIMEOUT);

            return { success: true, lock: newLock };
        } catch (error) {
            console.error(`Error acquiring ${lockType.toLowerCase()} lock:`, error);
            throw error;
        }
    }

    async releaseLock(resourceId, userId, lockType) {
        try {
            const result = await ResourceLock.deleteOne({ 
                resourceId, 
                userId,
                lockType 
            });
            return result.deletedCount > 0;
        } catch (error) {
            console.error(`Error releasing ${lockType.toLowerCase()} lock:`, error);
            throw error;
        }
    }

    async checkLock(resourceId, lockType) {
        try {
            const existingLock = await ResourceLock.findOne({ 
                resourceId,
                lockType,
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
            console.error(`Error checking ${lockType.toLowerCase()} lock:`, error);
            throw error;
        }
    }
}

module.exports = new ResourceLockService(); 