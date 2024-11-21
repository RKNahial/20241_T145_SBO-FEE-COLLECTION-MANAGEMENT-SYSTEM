// controllers/userController.js
const userService = require('../services/userService');

exports.registerUser = async (req, res) => {
    try {
        const user = await userService.addUser(req.body);
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
        if (req.body.position !== 'Admin') {
            return res.status(400).json({
                success: false,
                message: 'Invalid position for admin registration'
            });
        }

        const { admin, temporaryPassword } = await userService.addAdmin(req.body);
        
        res.status(201).json({
            success: true,
            message: 'Admin added successfully',
            data: {
                ...admin.toObject(),
                temporaryPassword
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

    try {
        if (!recaptchaToken) {
            return res.status(400).json({ message: 'reCAPTCHA verification failed. Please complete the reCAPTCHA.' });
        }

        const isRecaptchaValid = await userService.verifyRecaptcha(recaptchaToken);
        if (!isRecaptchaValid) {
            return res.status(400).json({ message: 'reCAPTCHA verification failed. Please try again.' });
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

        const token = userService.generateToken(user._id, position, user.isArchived);

        res.status(200).json({
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
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

exports.logout = async (req, res) => {
    try {
        const logoutResult = await userService.processLogout(
            req.body,
            req.ip,
            req.headers['user-agent']
        );

        res.status(200).json({
            success: true,
            message: 'Logout successful',
            logoutLogId: logoutResult.logoutLog._id,
            logoutTime: logoutResult.logoutTime,
            sessionDuration: logoutResult.sessionDuration
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

