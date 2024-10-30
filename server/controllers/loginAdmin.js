const Admin = require('../models/user'); // Import the correct model
const { comparePassword } = require('../helpers/authAdmin');
const axios = require('axios');

const loginAdmin = async (req, res) => {
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
        // Find the admin by email
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({ message: 'Invalid email or passwor.' });
        }

        // Check if the user is an admin
        if (!admin.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        // Compare passwords
        const isMatch = await comparePassword(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Exclude password from the response
        const { password: _, ...adminWithoutPassword } = admin.toObject();
        res.status(200).json({ message: 'Login successful!', admin: adminWithoutPassword });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error.', details: error.message });
    }
};

module.exports = { loginAdmin };
