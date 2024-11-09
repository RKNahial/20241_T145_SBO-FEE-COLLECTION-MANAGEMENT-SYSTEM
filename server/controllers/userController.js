// controllers/userController.js
const Admin = require('../models/AdminSchema');
const Treasurer = require('../models/TreasurerSchema');
const Officer = require('../models/OfficerSchema');
const Governor = require('../models/GovernorSchema');
const { addUser } = require('../services/userServices');
const axios = require('axios');

// Register a new user
exports.registerUser = async (req, res) => {
    try {
        const user = await addUser(req.body);
        res.status(201).json({ message: `${user.position} added successfully` });
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ message: 'Failed to add user', error: error.message });
    }
};  

exports.login = async (req, res) => {
    const { email, password, recaptchaToken } = req.body;

    // Check if reCAPTCHA token is provided
    if (!recaptchaToken) {
        return res.status(400).json({ message: 'reCAPTCHA verification failed. Please complete the reCAPTCHA.' });
    }

    try {
        // Verify reCAPTCHA token with Google
        const recaptchaResponse = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
            params: {
                secret: process.env.RECAPTCHA_SECRET_KEY, // Access secret key from .env
                response: recaptchaToken,
            },
        });

        if (!recaptchaResponse.data.success) {
            return res.status(400).json({ message: 'reCAPTCHA verification failed. Please try again.' });
        }

        // List of all models to check (Admin, Treasurer, Officer, Governor)
        const models = [Admin, Treasurer, Officer, Governor];

        let user = null;
        let position = null;

        // Loop through all models to find the user
        for (let i = 0; i < models.length; i++) {
            const Model = models[i];
            user = await Model.findOne({ email });

            if (user) {
                position = user.position;
                break;  // Exit the loop once a user is found
            }
        }

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check email domain for specific positions
        if (['Governor', 'Treasurer', 'Officer'].includes(position) && !email.endsWith('@student.buksu.edu.ph')) {
            return res.status(403).json({ message: 'Access denied. Invalid email domain.' });
        }

        // Compare the password (assuming password is hashed)
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.status(200).json({ message: 'Login successful', position });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
