// controllers/userController.js
const Admin = require('../models/AdminSchema');
const Treasurer = require('../models/TreasurerSchema');
const Officer = require('../models/OfficerSchema');
const Governor = require('../models/GovernorSchema');
const { addUser } = require('../services/userServices');
const axios = require('axios');
const Log = require('../models/LogSchema');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Register a new user
exports.registerUser = async (req, res) => {
    try {
        const user = await addUser(req.body);
        res.status(201).json({ 
            success: true,
            message: `${user.position} added successfully`,
            data: user
        });
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ 
            success: false,
            message: error.message || 'Failed to add user' 
        });
    }
};

exports.addAdmin = async (req, res) => {
    try {
        const { ID, name, email, position } = req.body;
        
        if (position !== 'Admin') {
            return res.status(400).json({
                success: false,
                message: 'Invalid position for admin registration'
            });
        }

        // Generate a random password
        const password = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = new Admin({
            ID,
            name,
            email,
            password: hashedPassword,
            position
        });

        await newAdmin.save();

        res.status(201).json({
            success: true,
            message: 'Admin added successfully',
            data: {
                ...newAdmin.toObject(),
                temporaryPassword: password
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error adding admin',
            error: error.message
        });
    }
};

exports.login = async (req, res) => {
    const { email, password, recaptchaToken } = req.body;

    if (!recaptchaToken) {
        return res.status(400).json({ message: 'reCAPTCHA verification failed. Please complete the reCAPTCHA.' });
    }

    try {
        const recaptchaResponse = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
            params: {
                secret: process.env.RECAPTCHA_SECRET_KEY,
                response: recaptchaToken,
            },
        });

        if (!recaptchaResponse.data.success) {
            return res.status(400).json({ message: 'reCAPTCHA verification failed. Please try again.' });
        }

        const models = [Admin, Treasurer, Officer, Governor];
        let user = null;
        let position = null;

        for (const Model of models) {
            user = await Model.findOne({ email });
            if (user) {
                position = Model.modelName.replace('Model', '');
                break;
            }
        }

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check if user is archived
        if (user.isArchived === true) {
            return res.status(403).json({ 
                success: false,
                message: 'Account is archived. Please contact the administrator.' 
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

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

        const token = jwt.sign(
            { 
                userId: user._id, 
                position: position,
                isArchived: user.isArchived
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        return res.status(200).json({ 
            success: true,
            message: 'Login successful', 
            token,
            position,
            userId: user._id,
            email: user.email,
            loginLogId: loginLog._id,
            name: user.name
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Server error', 
            error: error.message 
        });
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
