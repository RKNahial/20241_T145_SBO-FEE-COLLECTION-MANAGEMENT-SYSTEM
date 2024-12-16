const googleAuthService = require('../services/googleAuthService');

exports.verifyGoogleUser = async (req, res) => {
    try {
        const { email } = req.body;
        console.log('\n🔐 Starting Google user verification...');
        console.log(`🔍 Google Account Found: ${email}`);
        
        const user = await googleAuthService.findUserInCollections(email);
        
        if (user && user.authorized) {
            console.log(`✨ User authenticated successfully as ${user.position}`);
            
            // Ensure user object has all required fields
            const userForLog = {
                _id: user._id,
                email: user.email,
                position: user.position,
                name: user.name || email.split('@')[0]
            };
            
            const token = googleAuthService.generateToken(userForLog);
            const loginLog = await googleAuthService.createLoginLog(userForLog);
            
            console.log(`👤 Google Account ${email} successfully authenticated and logged in`);

            return res.json({
                authorized: true,
                token: token,
                position: user.position,
                sessionDuration: 24 * 60 * 60 * 1000,
                loginLogId: loginLog._id,
                userId: user._id,
                email: user.email
            });
        }

        return res.json({ 
            authorized: false, 
            message: 'Access denied. Only authorized users can log in.' 
        });
    } catch (error) {
        console.error('❌ Authorization error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message,
            details: error.errors
        });
    }
};