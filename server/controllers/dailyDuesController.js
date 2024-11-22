const dailyDuesService = require('../services/dailyDuesService');

exports.getDailyDues = async (req, res) => {
    try {
        const { month, week } = req.query;
        const allUsers = await dailyDuesService.getAllUsers();

        const duesPromises = allUsers.map(async user => {
            const duesRecord = await dailyDuesService.getDuesRecord(
                user._id,
                user.userType,
                month,
                week
            );

            return {
                userId: user._id,
                officerName: user.officerName,
                userType: user.userType,
                dues: duesRecord.dues
            };
        });

        const duesRecords = await Promise.all(duesPromises);
        res.json(duesRecords);
    } catch (error) {
        console.error('Error fetching dues:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dues',
            error: error.message
        });
    }
};

exports.updateDailyDues = async (req, res) => {
    try {
        const { userId } = req.params;
        const { amount, userType, month, week, daysCount } = req.body;

        const { record, updatedCount } = await dailyDuesService.updateDuesPayment(
            userId,
            userType,
            month,
            week,
            daysCount
        );

        res.json({
            success: true,
            message: `Successfully paid ${updatedCount} days for ${month} Week ${week}`,
            data: record
        });
    } catch (error) {
        console.error('Error updating dues:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating dues',
            error: error.message
        });
    }
};

exports.toggleDuesStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { month, week, day, newStatus } = req.body;

        if (!userId || !month || !week || !day || !newStatus) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        const result = await dailyDuesService.toggleDuesStatus(
            userId,
            day,
            month,
            week
        );

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Dues record not found'
            });
        }

        res.json({
            success: true,
            message: 'Dues status updated successfully',
            data: result
        });
    } catch (error) {
        console.error('Error updating dues:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating dues status',
            error: error.message
        });
    }
}; 