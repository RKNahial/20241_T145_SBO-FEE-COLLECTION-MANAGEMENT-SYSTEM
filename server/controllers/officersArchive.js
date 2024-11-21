const officerArchiveService = require('../services/officerArchiveService');

exports.archiveOfficer = async (req, res) => {
    try {
        const { officerId } = req.params;
        const { reason } = req.body;

        const result = await officerArchiveService.archiveOfficer(officerId, reason);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error in archiveOfficer controller:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to archive officer',
            error: error.message
        });
    }
};

exports.getArchivedOfficers = async (req, res) => {
    try {
        const result = await officerArchiveService.getArchivedOfficers();
        res.status(200).json(result);
    } catch (error) {
        console.error('Error in getArchivedOfficers controller:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch archived officers',
            error: error.message
        });
    }
};
