const bcrypt = require('bcrypt');

// Function to hash a password
const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
};

// Function to compare passwords
const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

module.exports = { hashPassword, comparePassword };