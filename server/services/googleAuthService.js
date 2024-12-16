const AdminModel = require('../models/AdminSchema');
const GovernorModel = require('../models/GovernorSchema');
const TreasurerModel = require('../models/TreasurerSchema');
const OfficerModel = require('../models/OfficerSchema');
const Log = require('../models/LogSchema');
const jwt = require('jsonwebtoken');

class GoogleAuthService {
    async findUserInCollections(email) {
        console.log(`🔍 Searching for user with email: ${email}`);
        
        const collections = [
            { model: AdminModel, position: 'Admin' },
            { model: GovernorModel, position: 'Governor' },
            { model: TreasurerModel, position: 'Treasurer' },
            { model: OfficerModel, position: 'Officer' }
        ];

        for (const { model, position } of collections) {
            const user = await model.findOne({ email });
            if (user) {
                console.log(`✅ Found user in ${position} collection`);
                return { ...user.toObject(), position, authorized: true };
            }
        }

        console.log('❌ User not found in any collection');
        return null;
    }

    generateToken(user) {
        return jwt.sign(
            {
                userId: user._id,
                email: user.email,
                position: user.position
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
    }

    async createLoginLog(user) {
        const loginLog = await Log.create({
            userId: user._id,
            userModel: user.position,
            email: user.email,
            action: 'login',
            timestamp: new Date(),
            status: 'active',
            details: `User ${user.email} logged in successfully`
        });
        console.log(`📝 Login log created with ID: ${loginLog._id}`);
        return loginLog;
    }
}

module.exports = new GoogleAuthService();