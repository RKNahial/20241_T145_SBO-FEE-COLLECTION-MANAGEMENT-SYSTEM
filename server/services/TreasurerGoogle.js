// services/officerService.js
const OfficerModel = require('../models/OfficerSchema'); 

// Function to verify if the email belongs to a Treasurer officer
const verifyTreasurerUser = async (email) => {
    // Check if email exists in officers collection
    const officer = await OfficerModel.findOne({ email });

    if (officer) {
        if (officer.position.trim().toLowerCase() === 'treasurer') {
            return { authorized: true };
        } else {
            return { authorized: false, message: 'Access denied. Only Treasurers can log in here!' };
        }
    } else {
        return { authorized: false, message: 'User not found' };
    }
};

module.exports = { verifyTreasurerUser };
