const User = require('../models/OfficerSchema');
const { hashPassword } = require('../helpers/authOfficer');

// Test endpoint to check if the server is running


// User registration
const registerOfficer = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password || password.length < 6) {
            return res.status(400).json({ error: 'Invalid input' });
        }

        // Check if the email already exists
        const exist = await User.findOne({ email });
        if (exist) {
            return res.status(400).json({ error: 'Email is already taken!' });
        }

        // Hash the password
        const hashedPassword = await hashPassword(password);

        // Log hashed password for debugging (remove in production)
        console.log('Hashed Password:', hashedPassword);

        const user = await User.create({ name, email, password: hashedPassword });

        // Exclude password from the response for security reasons
        const { password: _, ...userWithoutPassword } = user.toObject();

        return res.status(201).json(userWithoutPassword);
    } catch (error) {
        console.error('Registration error:', error); // Log the error
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};
module.exports = {registerOfficer};