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
            
            if (filters.startDate) {
                query.timestamp = { $gte: new Date(filters.startDate) };
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