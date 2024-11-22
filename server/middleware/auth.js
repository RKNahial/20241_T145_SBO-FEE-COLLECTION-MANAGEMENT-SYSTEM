const jwt = require('jsonwebtoken');
const Admin = require('../models/AdminSchema');
const Treasurer = require('../models/TreasurerSchema');
const Officer = require('../models/OfficerSchema');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        let user;
        const userModel = decoded.position;
        const Model = {
            'Admin': Admin,
            'Treasurer': Treasurer,
            'Officer': Officer
        }[userModel];

        if (!Model) {
            throw new Error('Invalid user position');
        }

        user = await Model.findById(decoded.userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Attach complete user info to request
        req.user = {
            _id: user._id,
            name: user.name || user.email.split('@')[0],
            email: user.email,
            position: userModel,
            picture: user.picture || user.imageUrl
        };

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Authentication failed' });
    }
};

module.exports = auth; 