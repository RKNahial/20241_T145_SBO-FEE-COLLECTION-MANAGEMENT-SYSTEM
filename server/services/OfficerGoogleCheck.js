// services/officerService.js
const Officer = require('../models/OfficerSchema');

exports.findOfficerByEmail = async (email) => {
    try {
        const officer = await Officer.findOne({ email });
        return officer;
    } catch (error) {
        throw new Error("Error finding officer by email");
    }
};
