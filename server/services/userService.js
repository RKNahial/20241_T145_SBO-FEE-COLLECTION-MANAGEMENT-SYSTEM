const bcrypt = require('bcrypt');
const Admin = require('../models/AdminSchema');
const Treasurer = require('../models/TreasurerSchema');
const Officer = require('../models/OfficerSchema');
const Governor = require('../models/GovernorSchema');

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
    const { ID, name, email, password, position } = userData;

    // Determine the model based on position
    const Model = getModelByPosition(position);

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with hashed password
    const newUser = new Model({
        ID,
        name,
        email,
        password: hashedPassword,
        position
    });

    // Save the user to the correct collection
    return await newUser.save();
};

// Add comparePassword method to the schema for each model
const addComparePasswordMethod = (schema) => {
    schema.methods.comparePassword = async function(password) {
        return await bcrypt.compare(password, this.password);
    };
};

// Attach comparePassword method to models
addComparePasswordMethod(Admin.schema);
addComparePasswordMethod(Treasurer.schema);
addComparePasswordMethod(Officer.schema);
addComparePasswordMethod(Governor.schema);

module.exports = { addUser };
