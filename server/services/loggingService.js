const HistoryLog = require('../models/HistoryLog');

class LoggingService {
    async createLog(logData) {
        try {
            const log = new HistoryLog(logData);
            await log.save();
            return log;
        } catch (error) {
            console.error('Error creating log:', error);
            throw error;
        }
    }

    async getLogs(filters = {}) {
        try {
            let query = {};
            
            // Handle date range filtering
            if (filters.startDate || filters.endDate) {
                query.timestamp = {};
                
                if (filters.startDate) {
                    // Set time to start of day (00:00:00)
                    const startDate = new Date(filters.startDate);
                    startDate.setHours(0, 0, 0, 0);
                    query.timestamp.$gte = startDate;
                }
                
                if (filters.endDate) {
                    // Set time to end of day (23:59:59)
                    const endDate = new Date(filters.endDate);
                    endDate.setHours(23, 59, 59, 999);
                    query.timestamp.$lte = endDate;
                }
            }
            
            if (filters.action) {
                query.action = filters.action;
            }

            return await HistoryLog.find(query).sort({ timestamp: -1 });
        } catch (error) {
            console.error('Error fetching logs:', error);
            throw error;
        }
    }
}

module.exports = new LoggingService(); 