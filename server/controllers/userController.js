// controllers/userController.js
const userService = require('../services/userService');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res) => {
    try {
        const result = await userService.addUser(req.body);
        res.status(201).json({
            success: true,
            message: 'Officer added successfully',
            temporaryPassword: result.temporaryPassword,
            user: result.user
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
        const result = await userService.addAdmin(req.body);
        res.status(201).json({
            success: true,
            message: 'Admin added successfully',
            data: {
                ...result.admin.toObject(),
                temporaryPassword: result.temporaryPassword
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to add admin'
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

