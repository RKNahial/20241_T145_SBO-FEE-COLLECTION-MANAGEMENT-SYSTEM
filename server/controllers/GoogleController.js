const AdminModel = require('../models/AdminSchema');
const GovernorModel = require('../models/GovernorSchema');
const TreasurerModel = require('../models/TreasurerSchema');
const OfficerModel = require('../models/OfficerSchema');
const Log = require('../models/LogSchema');
const jwt = require('jsonwebtoken');

// Add this function at the top of your file, after the imports
const findUserInCollections = async (email) => {
    console.log(`🔍 Searching for user with email: ${email}`);
    
    const admin = await AdminModel.findOne({ email });
    if (admin) {
        console.log('✅ Found user in Admin collection');
        return { ...admin.toObject(), position: 'Admin', authorized: true };
    }

    const governor = await GovernorModel.findOne({ email });
    if (governor) {
        console.log('✅ Found user in Governor collection');
        return { ...governor.toObject(), position: 'Governor', authorized: true };
    }

    const treasurer = await TreasurerModel.findOne({ email });
    if (treasurer) {
        console.log('✅ Found user in Treasurer collection');
        return { ...treasurer.toObject(), position: 'Treasurer', authorized: true };
    }

    const officer = await OfficerModel.findOne({ email });
    if (officer) {
        console.log('✅ Found user in Officer collection');
        return { ...officer.toObject(), position: 'Officer', authorized: true };
    }

    console.log('❌ User not found in any collection');
    return null;
};

// Function to verify Google login
exports.verifyGoogleUser = async (req, res) => {
    try {
        const { email } = req.body;
        console.log('\n🔐 Starting Google user verification...');
        console.log(`🔍 Google Account Found: ${email}`);
        
        const user = await findUserInCollections(email);
        
        if (user && user.authorized) {
            console.log(`✨ User authenticated successfully as ${user.position}`);
            
            // Generate JWT token
            const token = jwt.sign(
                {
                    userId: user._id,
                    email: user.email,
                    position: user.position
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
            
            const loginLog = await Log.create({
                userId: user._id,
                userModel: user.position,
                action: 'login',
                timestamp: new Date(),
                status: 'active',
                details: `User ${email} logged in successfully`
            });
            console.log(`📝 Login log created with ID: ${loginLog._id}`);
            console.log(`👤 Google Account ${email} successfully authenticated and logged in`);

            return res.json({
                authorized: true,
                token: token,
                position: user.position,
                sessionDuration: 24 * 60 * 60 * 1000,
                loginLogId: loginLog._id
            });
        } else {
            console.log('🚫 Authentication failed - User not authorized');
        }

        return res.json({ 
            authorized: false, 
            message: 'Access denied. Only authorized users can log in.' 
        });
    } catch (error) {
        console.error('❌ Authorization error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
