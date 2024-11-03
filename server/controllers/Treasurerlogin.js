const { validateTreasurerCredentials } = require('../services/TreasurerService');

exports.loginTreasurer = async (req, res) => {
    const { email, password } = req.body;

    console.log('Logging in:', { email }); // Log the login attempt

    try {
        const treasurer = await validateTreasurerCredentials(email, password);
        res.status(200).json({ message: 'Treasurer login successful', treasurer });
    } catch (error) {
        console.error('Login error:', error);
        if (error.message === 'User not found') {
            return res.status(404).json({ message: error.message });
        } else if (error.message === 'Access denied. Only treasurers can log in here.') {
            return res.status(403).json({ message: error.message });
        } else {
            return res.status(401).json({ message: error.message });
        }
    }
};
