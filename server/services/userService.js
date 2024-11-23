const Admin = require('../models/AdminSchema');
const Treasurer = require('../models/TreasurerSchema');
const Officer = require('../models/OfficerSchema');
const Governor = require('../models/GovernorSchema');
const Log = require('../models/LogSchema');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const axios = require('axios');

class UserService {
    async verifyRecaptcha(token) {
        try {
            const secretKey = process.env.RECAPTCHA_SECRET_KEY;
            const response = await axios.post(
                `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`
            );
            
            return response.data.success;
        } catch (error) {
            console.error('reCAPTCHA verification error:', error);
            return false;
        }
    }

    async findUserByEmail(email) {
        const models = [Admin, Treasurer, Officer, Governor];
        for (const Model of models) {
            const user = await Model.findOne({ email });
            if (user) {
                return {
                    user,
                    position: Model.modelName.replace('Model', '')
                };
            }
        }
        return null;
    }

    async createLoginLog(userId, position, email, ipAddress, userAgent) {
        try {
            return await Log.create({
                userId,
                userModel: position,
                email: email,
                action: 'login',
                timestamp: new Date(),
                details: {
                    ipAddress,
                    userAgent
                },
                status: 'active'
            });
        } catch (error) {
            console.error('Error creating login log:', error);
            throw error;
        }
    }

    generateToken(userId, position, isArchived) {
        return jwt.sign(
            { userId, position, isArchived },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );
    }

    async addAdmin(userData) {
        const { ID, name, email, position } = userData;
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
        
        return {
            admin: newAdmin,
            temporaryPassword: password
        };
    }

    async addUser(userData) {
        const { name, ID, email, position } = userData;
        const password = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(password, 10);

        let UserModel;
        switch (position.toLowerCase()) {
            case 'officer':
                UserModel = Officer;
                break;
            case 'governor':
                UserModel = Governor;
                break;
            case 'treasurer':
                UserModel = Treasurer;
                break;
            default:
                throw new Error('Invalid position');
        }

        const newUser = new UserModel({
            ID,
            name,
            email,
            password: hashedPassword,
            position: position.toLowerCase()
        });

        await newUser.save();
        return { 
            position, 
            user: newUser,
            temporaryPassword: password 
        };
    }

}

module.exports = new UserService(); 