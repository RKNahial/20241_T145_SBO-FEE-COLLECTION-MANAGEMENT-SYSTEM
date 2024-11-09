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
            { model: AdminModel, position: 'admin', emailDomain: null },
            { model: GovernorModel, position: 'governor', emailDomain: '@student.buksu.edu.ph' },
            { model: TreasurerModel, position: 'treasurer', emailDomain: '@student.buksu.edu.ph' },
            { model: OfficerModel, position: 'officer', emailDomain: '@student.buksu.edu.ph' }
        ];

        // Loop through each collection to find the user by email
        for (const { model, position, emailDomain } of collections) {
            const user = await model.findOne({ email });

            if (user) {
                // Check email domain for non-admin positions
                if (emailDomain && !email.endsWith(emailDomain)) {
                    return res.status(403).json({ authorized: false, message: 'Access denied. Invalid email domain.' });
                }
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