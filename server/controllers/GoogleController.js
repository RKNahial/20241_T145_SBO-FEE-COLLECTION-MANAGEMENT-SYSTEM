const AdminModel = require('../models/AdminSchema');
const GovernorModel = require('../models/GovernorSchema');
const TreasurerModel = require('../models/TreasurerSchema');
const OfficerModel = require('../models/OfficerSchema');

// Function to verify Google login
const verifyGoogleUser = async (req, res) => {
    try {
        const { email } = req.body;

        // Define the collections to check with respective models and positions
        const collections = [
            { model: AdminModel, position: 'admin' },
            { model: GovernorModel, position: 'governor' },
            { model: TreasurerModel, position: 'treasurer' },
            { model: OfficerModel, position: 'officer' }
        ];

        // Loop through each collection to find the user by email
        for (const { model, position } of collections) {
            const user = await model.findOne({ email });

            if (user) {
                // User found, return authorized with position
                return res.json({ authorized: true, position });
            }
        }

        // If no user is found in any collection
        return res.json({ authorized: false, message: 'Access denied. Only authorized users can log in.' });
    } catch (error) {
        console.error('Authorization error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { verifyGoogleUser };
