const officialService = require('../services/officialService');

exports.getAllOfficials = async (req, res) => {
    try {
        const allOfficials = await officialService.getAllOfficials();
        res.status(200).json({
            success: true,
            data: allOfficials
        });
    } catch (error) {
        console.error('Error fetching officials:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch officials',
            error: error.message
        });
    }
};

exports.toggleArchiveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.query;
        const isArchiving = req.path.includes('archive');

        const official = await officialService.toggleArchiveStatus(id, type, isArchiving);

        res.status(200).json({
            success: true,
            message: `Official ${isArchiving ? 'archived' : 'unarchived'} successfully`,
            data: official
        });
    } catch (error) {
        console.error('Error toggling archive status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update archive status',
            error: error.message
        });
    }
};

exports.getOfficialById = async (req, res) => {
    try {
        const { id } = req.params;
        const official = await officialService.getOfficialById(id);

        res.status(200).json({
            success: true,
            data: official
        });
    } catch (error) {
        console.error('Error fetching official:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching official',
            error: error.message
        });
    }
};

exports.updateOfficial = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, ID, email, position, type } = req.body;

        if (!name || !ID || !email || !position || !type) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        const updatedOfficial = await officialService.updateOfficial(id, req.body);

        res.status(200).json({
            success: true,
            message: 'Official updated successfully',
            data: updatedOfficial
        });
    } catch (error) {
        console.error('Error updating official:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error updating official'
        });
    }
}; 