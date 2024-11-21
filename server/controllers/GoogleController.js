const googleAuthService = require('../services/googleAuthService');

exports.verifyGoogleUser = async (req, res) => {
    try {
        const { email } = req.body;
        console.log('\n🔐 Starting Google user verification...');
        console.log(`🔍 Google Account Found: ${email}`);
        
        const user = await googleAuthService.findUserInCollections(email);
        
        if (user && user.authorized) {
            console.log(`✨ User authenticated successfully as ${user.position}`);
            
            const token = googleAuthService.generateToken(user);
            const loginLog = await googleAuthService.createLoginLog(user);
            
            console.log(`👤 Google Account ${email} successfully authenticated and logged in`);

            return res.json({
                authorized: true,
                token: token,
                position: user.position,
                sessionDuration: 24 * 60 * 60 * 1000,
                loginLogId: loginLog._id
            });
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
