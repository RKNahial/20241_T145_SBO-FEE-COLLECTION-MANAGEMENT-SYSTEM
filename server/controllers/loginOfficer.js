const User = require('../models/OfficerSchema');
const {comparePassword } = require('../helpers/authOfficer');
const axios = require('axios');


const loginOfficer = async (req, res) => {
    const { email, password, recaptchaToken } = req.body;

    // Verify reCAPTCHA
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;
    const response = await axios.post(verificationUrl);
    const { success } = response.data;

    if (!success) {
        return res.status(400).json({ message: 'reCAPTCHA verification failed.' });
    }

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Check if the user is an admin
        if (!user.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        // Compare passwords
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Exclude password from the response
        const { password: _, ...userWithoutPassword } = user.toObject();
        res.status(200).json({ message: 'Login successful!', user: userWithoutPassword });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error.', details: error.message });
    }
};

module.exports = {loginOfficer};
