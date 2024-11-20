const Admin = require('../models/AdminSchema');
const Treasurer = require('../models/TreasurerSchema');
const Officer = require('../models/OfficerSchema');
const Governor = require('../models/GovernorSchema');

// Get all officials (Officers, Treasurers, Governors)
exports.getAllOfficials = async (req, res) => {
    try {
        // Fetch data from all collections
        const [officers, treasurers, governors] = await Promise.all([
            Officer.find().select('-password'),
            Treasurer.find().select('-password'),
            Governor.find().select('-password')
        ]);

        // Combine and format the data
        const allOfficials = [
            ...officers.map(officer => ({
                ...officer.toObject(),
                type: 'Officer'
            })),
            ...treasurers.map(treasurer => ({
                ...treasurer.toObject(),
                type: 'Treasurer'
            })),
            ...governors.map(governor => ({
                ...governor.toObject(),
                type: 'Governor'
            }))
        ];

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

// Archive/Unarchive official
exports.toggleArchiveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.query;
        const isArchiving = req.path.includes('archive');

        let Model;
        switch (type) {
            case 'Officer':
                Model = Officer;
                break;
            case 'Treasurer':
                Model = Treasurer;
                break;
            case 'Governor':
                Model = Governor;
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid official type'
                });
        }

        const updateData = {
            isArchived: isArchiving,
            archivedAt: isArchiving ? new Date() : null
        };

        const official = await Model.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!official) {
            return res.status(404).json({
                success: false,
                message: 'Official not found'
            });
        }

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
        
        // Try to find the official in each collection
        let official = await Officer.findById(id).select('-password');
        let type = 'Officer';

        if (!official) {
            official = await Treasurer.findById(id).select('-password');
            type = 'Treasurer';
        }

        if (!official) {
            official = await Governor.findById(id).select('-password');
            type = 'Governor';
        }

        if (!official) {
            return res.status(404).json({
                success: false,
                message: 'Official not found'
            });
        }

        // Add the type and position to the response
        const officialWithType = {
            ...official.toObject(),
            type,
            position: official.position || type // Use existing position or fallback to type
        };

        res.status(200).json({
            success: true,
            data: officialWithType
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

        // Validate required fields
        if (!name || !ID || !email || !position || !type) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        let Model;
        switch (type) {
            case 'Officer':
                Model = Officer;
                break;
            case 'Treasurer':
                Model = Treasurer;
                break;
            case 'Governor':
                Model = Governor;
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid official type'
                });
        }

        // Check if email already exists for another user
        const existingUser = await Model.findOne({ 
            email: email,
            _id: { $ne: id } // Exclude current user
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

        const updatedOfficial = await Model.findByIdAndUpdate(
            id,
            { 
                name, 
                ID, 
                email, 
                position,
                updatedAt: new Date()
            },
            { 
                new: true, 
                runValidators: true 
            }
        ).select('-password');

        if (!updatedOfficial) {
            return res.status(404).json({
                success: false,
                message: 'Official not found'
            });
        }

        // Add audit log here if needed
        
        res.status(200).json({
            success: true,
            message: 'Official updated successfully',
            data: { ...updatedOfficial.toObject(), type }
        });
    } catch (error) {
        console.error('Error updating official:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error updating official'
        });
    }
}; 