const { hashPassword, comparePassword } = require('../helpers/authOfficer');
const Admin = require('../models/AdminSchema');
const Treasurer = require('../models/TreasurerSchema');
const Officer = require('../models/OfficerSchema');
const Governor = require('../models/GovernorSchema');
const { generatePassword } = require('../utils/passwordGenerator');

// Utility function to validate email domain based on position
const validateEmailDomain = (email, position) => {
    if (position.toLowerCase() === 'admin') {
        return true; // Admin can use any email domain
    }
    
    // For other positions, enforce @student.buksu.edu.ph
    return email.endsWith('@student.buksu.edu.ph');
};

// Utility function to map position to corresponding model
const getModelByPosition = (position) => {
    switch (position.toLowerCase()) {
        case 'admin':
            return Admin;
        case 'treasurer':
            return Treasurer;
        case 'officer':
            return Officer;
        case 'governor':
            return Governor;
        default:
            throw new Error('Invalid position');
    }
};

// Add a new user
const addUser = async (userData) => {
    const { ID, name, email, position } = userData;

    // Validate email domain
    if (!validateEmailDomain(email, position)) {
        throw new Error(`${position} must use an email with @student.buksu.edu.ph domain`);
    }

    const password = generatePassword();
    console.log(`Generated password for user ${name}: ${password}`);

    const Model = getModelByPosition(position);
    const hashedPassword = await hashPassword(password);

    const newUser = new Model({
        ID,
        name,
        email,
        password: hashedPassword,
        position
    });

    try {
        // Save the user to the correct collection
        return await newUser.save();
    } catch (error) {
        if (error.code === 11000) {
            throw new Error('Email already exists');
        }
        throw error;
    }
};

// Add comparePassword method to the schema for each model
const addComparePasswordMethod = (schema) => {
    schema.methods.comparePassword = async function(password) {
        return await comparePassword(password, this.password);
    };
};

// Attach comparePassword method to models
addComparePasswordMethod(Admin.schema);
addComparePasswordMethod(Treasurer.schema);
addComparePasswordMethod(Officer.schema);
addComparePasswordMethod(Governor.schema);

module.exports = { addUser };
