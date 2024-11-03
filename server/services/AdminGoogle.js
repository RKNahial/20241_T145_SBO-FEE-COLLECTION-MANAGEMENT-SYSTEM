const AdminModel = require('../models/AdminSchema'); 

// Function to verify Google login
const verifyGoogleUser = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if email exists in admins collection
        const admin = await AdminModel.findOne({ email });

        if (admin) {
            return res.json({ authorized: true });
        } else {
            return res.json({ authorized: false, message: 'Access denied. Admin only!' });
        }
    } catch (error) {
        console.error('Authorization error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { verifyGoogleUser };
