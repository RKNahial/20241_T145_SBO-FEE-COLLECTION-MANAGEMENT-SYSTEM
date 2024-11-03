const Officer = require('../models/OfficerSchema');
const bcrypt = require('bcrypt');

exports.validateTreasurerCredentials = async (email, password) => {
    console.log("Validating treasurer credentials for email:", email);
    const treasurer = await Officer.findOne({ email });
    
    console.log("Treasurer from DB:", treasurer); // Log retrieved treasurer

    if (!treasurer) {
        console.log("Treasurer not found");
        throw new Error('User not found');
    }

    console.log("Treasurer found:", treasurer);
    console.log("Position:", treasurer.position); // Log the position value

    // Use toLowerCase for case-insensitive comparison
    if (treasurer.position.trim().toLowerCase() !== 'treasurer') {
        console.log("Access denied for position:", treasurer.position);
        throw new Error('Access denied. Only treasurers can log in here.');
    }

    const isPasswordValid = await bcrypt.compare(password, treasurer.password);
    console.log("Checking password:", password); // Log the plain password being checked
    console.log("Stored password hash:", treasurer.password); // Log the stored hash
    console.log("Password valid:", isPasswordValid); // Log password validation result

    if (!isPasswordValid) {
        console.log("Invalid password for email:", email);
        throw new Error('Invalid email or password');
    }

    return treasurer;
};
