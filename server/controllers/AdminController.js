const { loginAdminService, registerUserService } = require('../services/AdminService');

const loginAdmin = async (req, res) => {
    const { email, password, recaptchaToken } = req.body;

    try {
        const result = await loginAdminService(email, password, recaptchaToken);
        res.status(result.status).json(result.data);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error.', details: error.message });
    }
};

const registerUser = async (req, res) => {
    try {
        const user = await registerUserService(req.body);
        res.status(201).json(user);
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

module.exports = { loginAdmin, registerUser };
