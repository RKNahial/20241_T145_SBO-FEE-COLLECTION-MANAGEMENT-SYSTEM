// controllers/userController.js
const Admin = require('../models/AdminSchema'); // Import the Admin model
const Treasurer = require('../models/TreasurerSchema'); // Import the Treasurer model
const Officer = require('../models/OfficerSchema'); // Import the Officer model
const Governor = require('../models/GovernorSchema'); // Import the Governor model
const { getModelByPosition } = require('../services/userService'); // Import the function

const { addUser } = require('../services/userService');

// Register a new user
exports.registerUser = async (req, res) => {
    try {
        const user = await addUser(req.body);
        res.status(201).json({ message: `${user.position} added successfully` });
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ message: 'Failed to add user', error: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // List of all models to check (Admin, Treasurer, Officer, Governor)
        const models = [Admin, Treasurer, Officer, Governor];

        let user = null;
        let position = null;

        // Loop through all models to find the user
        for (let i = 0; i < models.length; i++) {
            const Model = models[i];
            user = await Model.findOne({ email });

            if (user) {
                position = user.position;
                break;  // Exit the loop once a user is found
            }
        }

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Compare the password (assuming password is hashed)
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Login successful, return the user's position and message
        res.status(200).json({ message: 'Login successful', position });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};