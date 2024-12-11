// controllers/userController.js
const userService = require('../services/userService');
const jwt = require('jsonwebtoken');
const HistoryLog = require('../models/HistoryLog');

exports.registerUser = async (req, res) => {
    try {
        const result = await userService.addUser(req.body);
        res.status(201).json({
            success: true,
            message: `${result.position} added successfully`,
            temporaryPassword: result.temporaryPassword,
            data: {
                ...result.user.toObject(),
                password: undefined
            }
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
        console.log('Starting admin addition process:', {
            requestBody: { ...req.body, password: '[REDACTED]' },
            timestamp: new Date().toISOString()
        });

        if (req.body.position !== 'Admin') {
            console.warn('Invalid position for admin registration:', {
                providedPosition: req.body.position,
                status: 400
            });
            return res.status(400).json({
                success: false,
                message: 'Invalid position for admin registration'
            });
        }

        const { admin, temporaryPassword } = await userService.addAdmin(req.body);
        
        console.log('Admin created successfully:', {
            adminId: admin._id,
            email: admin.email,
            name: admin.name,
            status: 201,
            timestamp: new Date().toISOString()
        });

        // Create history log
        await HistoryLog.create({
            timestamp: new Date(),
            userName: req.user.name,
            userEmail: req.user.email,
            userPosition: req.user.position,
            action: 'Add Admin',
            details: `Added new admin: ${admin.name} (${admin.email})`,
            status: 'completed'
        });

        res.status(201).json({
            success: true,
            message: 'Admin added successfully',
            data: {
                ...admin.toObject(),
                temporaryPassword
            }
        });
    } catch (error) {
        console.error('Admin creation failed:', {
            error: error.message,
            stack: error.stack,
            status: error.code === 11000 ? 400 : 500,
            timestamp: new Date().toISOString()
        });

        // Create error log if operation fails
        if (req.user) {
            await HistoryLog.create({
                timestamp: new Date(),
                userName: req.user.name,
                userEmail: req.user.email,
                userPosition: req.user.position,
                action: 'Add Admin',
                details: `Failed to add admin: ${error.message}`,
                status: 'failed'
            });
        }

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
    try {
        const { email, password, recaptchaToken } = req.body;
        
        // Skip recaptcha verification in development
        if (process.env.NODE_ENV !== 'development') {
            const isRecaptchaValid = await userService.verifyRecaptcha(recaptchaToken);
            if (!isRecaptchaValid) {
                return res.status(400).json({ message: 'Invalid reCAPTCHA' });
            }
        }

        const userFound = await userService.findUserByEmail(email);
        if (!userFound) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const { user, position } = userFound;

        if (user.isArchived) {
            return res.status(403).json({
                success: false,
                message: 'Account is archived. Please contact the administrator.'
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const loginLog = await userService.createLoginLog(
            user._id,
            position,
            user.email,
            req.ip,
            req.headers['user-agent']
        );

        const loginHistoryLog = await HistoryLog.create({
            timestamp: new Date(),
            userName: user.name,
            userEmail: user.email,
            userPosition: position,
            action: 'LOGIN',
            details: `User logged in: ${user.email}`,
            status: 'completed'
        });

        const token = jwt.sign(
            { userId: user._id, position },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            userId: user._id,
            email: user.email,
            position,
            loginLogId: loginLog._id
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
};

exports.logout = async (req, res) => {
    try {
        const { userId, loginLogId } = req.body;

        if (!userId || !loginLogId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameters'
            });
        }

        await userService.processLogout(userId, loginLogId);

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing logout',
            error: error.message
        });
    }
};

exports.getSessionHistory = async (req, res) => {
    try {
        const sessions = await userService.getSessionHistory(req.query);
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
