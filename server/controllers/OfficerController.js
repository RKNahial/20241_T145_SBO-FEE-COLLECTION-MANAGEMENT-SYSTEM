const { loginOfficerService, registerOfficerService } = require('../services/OfficerService');

const loginOfficer = async (req, res) => {
    const { email, password, recaptchaToken } = req.body;

    try {
        const result = await loginOfficerService(email, password, recaptchaToken);
        res.status(result.status).json(result.data);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error.', details: error.message });
    }
};

const registerOfficer = async (req, res) => {
    try {
        const officer = await registerOfficerService(req.body);
        res.status(201).json(officer);
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

module.exports = { loginOfficer, registerOfficer };
