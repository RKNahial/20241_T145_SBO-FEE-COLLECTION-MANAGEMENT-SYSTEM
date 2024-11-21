const Admin = require('../models/AdminSchema');
const Treasurer = require('../models/TreasurerSchema');
const Officer = require('../models/OfficerSchema');
const Governor = require('../models/GovernorSchema');

const findUserByEmail = async (email) => {
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
};

module.exports = { findUserByEmail }; 