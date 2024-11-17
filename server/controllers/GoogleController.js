const AdminModel = require('../models/AdminSchema');
const GovernorModel = require('../models/GovernorSchema');
const TreasurerModel = require('../models/TreasurerSchema');
const OfficerModel = require('../models/OfficerSchema');
const Log = require('../models/LogSchema');

// Function to verify Google login
exports.verifyGoogleUser = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await findUserInCollections(email);
        
        if (user && user.authorized) {
            // Create a login log entry
            const loginLog = await Log.create({
                userId: user._id,
                userModel: user.position,
                action: 'login',
                timestamp: new Date(),
                status: 'active'
            });

            return res.json({
                authorized: true,
                position: user.position,
                sessionDuration: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
                loginLogId: loginLog._id
            });
        }

        return res.json({ 
            authorized: false, 
            message: 'Access denied. Only authorized users can log in.' 
        });
    } catch (error) {
        console.error('Authorization error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
