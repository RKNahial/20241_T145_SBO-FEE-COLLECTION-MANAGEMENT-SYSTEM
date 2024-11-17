const AdminModel = require('../models/AdminSchema');
const GovernorModel = require('../models/GovernorSchema');
const TreasurerModel = require('../models/TreasurerSchema');
const OfficerModel = require('../models/OfficerSchema');
const Log = require('../models/LogSchema');

// Add this function at the top of your file, after the imports
const findUserInCollections = async (email) => {
    // Check each model for the user
    const admin = await AdminModel.findOne({ email });
    if (admin) return { ...admin.toObject(), position: 'Admin', authorized: true };

    const governor = await GovernorModel.findOne({ email });
    if (governor) return { ...governor.toObject(), position: 'Governor', authorized: true };

    const treasurer = await TreasurerModel.findOne({ email });
    if (treasurer) return { ...treasurer.toObject(), position: 'Treasurer', authorized: true };

    const officer = await OfficerModel.findOne({ email });
    if (officer) return { ...officer.toObject(), position: 'Officer', authorized: true };

    return null;
};

// Function to verify Google login
exports.verifyGoogleUser = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await findUserInCollections(email);
        
        if (user && user.authorized) {
            // Create a login log entry with details field
            const loginLog = await Log.create({
                userId: user._id,
                userModel: user.position,
                action: 'login',
                timestamp: new Date(),
                status: 'active',
                details: `User ${email} logged in successfully`
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
