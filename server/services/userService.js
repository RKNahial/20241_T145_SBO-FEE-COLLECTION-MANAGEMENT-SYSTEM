const Admin = require('../models/AdminSchema');
const Treasurer = require('../models/TreasurerSchema');
const Officer = require('../models/OfficerSchema');
const Governor = require('../models/GovernorSchema');
const Log = require('../models/LogSchema');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const axios = require('axios');
const { generatePassword } = require('../utils/passwordGenerator');
const { hashPassword, comparePassword } = require('../helpers/authOfficer');
const { findUserByEmail } = require('../utils/userUtils');

class UserService {
    // Email validation utility
    validateEmailDomain(email, position) {
        if (position.toLowerCase() === 'admin') {
            return true;
        }
        return email.endsWith('@student.buksu.edu.ph');
    }

    // Model mapping utility
    getModelByPosition(position) {
        switch (position.toLowerCase()) {
            case 'admin': return Admin;
            case 'treasurer': return Treasurer;
            case 'officer': return Officer;
            case 'governor': return Governor;
            default: throw new Error('Invalid position');
        }
    }

    async verifyRecaptcha(recaptchaToken) {
        const recaptchaResponse = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify`,
            null,
            {
                params: {
                    secret: process.env.RECAPTCHA_SECRET_KEY,
                    response: recaptchaToken,
                },
            }
        );
        return recaptchaResponse.data.success;
    }

    async findUserByEmail(email) {
        return findUserByEmail(email);
    }

    async createLoginLog(userId, position, email, ipAddress, userAgent) {
        return await Log.create({
            userId,
            userModel: position,
            action: 'login',
            timestamp: new Date(),
            details: {
                email,
                ipAddress,
                userAgent
            },
            status: 'active'
        });
    }

    generateToken(userId, position, isArchived) {
        return jwt.sign(
            { userId, position, isArchived },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );
    }

    async addUser(userData) {
        const { ID, name, email, position } = userData;

        if (!this.validateEmailDomain(email, position)) {
            throw new Error(`${position} must use an email with @student.buksu.edu.ph domain`);
        }

        const password = generatePassword();
        console.log(`Generated password for user ${name}: ${password}`);

        const Model = this.getModelByPosition(position);
        const hashedPassword = await hashPassword(password);

        const newUser = new Model({
            ID,
            name,
            email,
            password: hashedPassword,
            position
        });

        try {
            return await newUser.save();
        } catch (error) {
            if (error.code === 11000) {
                throw new Error('Email already exists');
            }
            throw error;
        }
    }

    async addAdmin(userData) {
        const { ID, name, email, position } = userData;
        const password = generatePassword();
        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = new Admin({
            ID,
            name,
            email,
            password: hashedPassword,
            position
        });

        const admin = await newAdmin.save();
        return { admin, temporaryPassword: password };
    }
}

// Add comparePassword method to all schemas
[Admin, Treasurer, Officer, Governor].forEach(Model => {
    Model.schema.methods.comparePassword = async function(password) {
        return await comparePassword(password, this.password);
    };
});

// Export a single instance
module.exports = new UserService(); 