// controllers/userController.js
const Admin = require('../models/AdminSchema');
const Treasurer = require('../models/TreasurerSchema');
const Officer = require('../models/OfficerSchema');
const Governor = require('../models/GovernorSchema');
const { addUser } = require('../services/userServices');
const axios = require('axios');
const Log = require('../models/LogSchema');
const jwt = require('jsonwebtoken');

// Register a new user
exports.registerUser = async (req, res) => {
    try {
        const user = await addUser(req.body);
        res.status(201).json({ message: `${user.position} added successfully` });
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ message: error.message || 'Failed to add user' });
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

        // Create the login log entry with more details
        const loginLog = await Log.create({ 
            userId: user._id, 
            userModel: position, 
            action: 'login',
            timestamp: new Date(),
            details: {
                email: user.email,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            },
            status: 'active'
        });

        console.log(`User ${user.email} logged in as ${position} at ${loginLog.timestamp}`);

        // Generate a JWT
        const token = jwt.sign(
            { userId: user._id, position: user.position },
            process.env.JWT_SECRET, // Ensure you have a secret key in your .env file
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        // Return all necessary user details
        return res.status(200).json({ 
            message: 'Login successful', 
            token, // Include the token in the response
            position,
            userId: user._id,
            email: user.email,
            loginLogId: loginLog._id,
            _id: user._id
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.logout = async (req, res) => {
    try {
        const { userId, userModel, email, loginLogId } = req.body;
        console.log('Logout request received:', { userId, userModel, email, loginLogId }); // Debug log

        // Validate required fields
        if (!userId || !userModel || !email || !loginLogId) {
            console.error('Missing required fields:', { userId, userModel, email, loginLogId });
            return res.status(400).json({ 
                success: false,
                message: 'Missing required fields for logout' 
            });
        }

        // Find the active login session
        const loginLog = await Log.findOne({ 
            _id: loginLogId,
            userId: userId,
            status: 'active'
        });

        if (!loginLog) {
            console.error(`No active login session found for ID: ${loginLogId}`);
            return res.status(404).json({
                success: false,
                message: 'Active login session not found'
            });
        }

        const logoutTime = new Date();
        const sessionDuration = (logoutTime - loginLog.timestamp) / 1000 / 60; // in minutes

        // Update the login log with logout information
        loginLog.status = 'completed';
        loginLog.details = {
            ...loginLog.details,
            logoutTimestamp: logoutTime,
            sessionDuration: Math.round(sessionDuration)
        };
        await loginLog.save();

        // Create a new logout log entry
        const logoutLog = new Log({ 
            userId, 
            userModel, 
            action: 'logout',
            timestamp: logoutTime,
            details: { 
                email,
                loginLogId,
                loginTimestamp: loginLog.timestamp,
                logoutTimestamp: logoutTime,
                sessionDuration: Math.round(sessionDuration),
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            },
            status: 'completed'
        });

        await logoutLog.save();

        console.log(`User ${email} logged out successfully. Session duration: ${Math.round(sessionDuration)} minutes`);
        
        res.status(200).json({ 
            success: true,
            message: 'Logout successful',
            logoutLogId: logoutLog._id,
            logoutTime: logoutTime,
            sessionDuration: Math.round(sessionDuration)
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error during logout', 
            error: error.message 
        });
    }
};

exports.getSessionHistory = async (req, res) => {
    try {
        const { userId, userModel } = req.query;
        const query = {};
        
        if (userId) query.userId = userId;
        if (userModel) query.userModel = userModel;

        const sessions = await Log.find(query)
            .sort({ timestamp: -1 }) // Most recent first
            .limit(100); // Limit to last 100 sessions

        res.status(200).json({
            success: true,
            sessions
        });
    } catch (error) {
        console.error('Error fetching session history:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching session history',
            error: error.message
        });
    }
};
