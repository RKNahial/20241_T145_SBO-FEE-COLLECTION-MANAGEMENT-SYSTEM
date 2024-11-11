const AdminModel = require('../models/AdminSchema');
const GovernorModel = require('../models/GovernorSchema');
const TreasurerModel = require('../models/TreasurerSchema');
const OfficerModel = require('../models/OfficerSchema');

// Function to verify Google login
exports.verifyGoogleUser = async (req, res) => {
    try {
        const { email } = req.body;

        const collections = [
            { model: AdminModel, position: 'admin', emailDomain: null },
            { model: GovernorModel, position: 'governor', emailDomain: '@student.buksu.edu.ph' },
            { model: TreasurerModel, position: 'treasurer', emailDomain: '@student.buksu.edu.ph' },
            { model: OfficerModel, position: 'officer', emailDomain: '@student.buksu.edu.ph' }
        ];

        for (const { model, position, emailDomain } of collections) {
            const user = await model.findOne({ email });

            if (user) {
                if (emailDomain && !email.endsWith(emailDomain)) {
                    return res.status(403).json({ authorized: false, message: 'Access denied. Invalid email domain.' });
                }
                return res.json({ authorized: true, position });
            }
        }

        return res.json({ authorized: false, message: 'Access denied. Only authorized users can log in.' });
    } catch (error) {
        console.error('Authorization error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
