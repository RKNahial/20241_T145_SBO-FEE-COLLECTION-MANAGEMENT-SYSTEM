const User = require('../models/OfficerSchema'); // Ensure the model name matches your file
const { hashPassword } = require('../helpers/authOfficer');

// User registration
const registerOfficer = async (req, res) => {
    try {
        // Destructure required fields from request body
        const { studentID, name, email, password, position } = req.body;

        // Validate input
        if (!studentID || !name || !email || !password || !position || password.length < 6) {
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

        // Create a new officer
        const user = await User.create({ studentID, name, email, password: hashedPassword, position });

        // Exclude password from the response for security reasons
        const { password: _, ...userWithoutPassword } = user.toObject();

        return res.status(201).json(userWithoutPassword);
    } catch (error) {
        console.error('Registration error:', error); // Log the error
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

module.exports = { registerOfficer };
