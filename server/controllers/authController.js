// const User = require('../models/user');
// const { hashPassword, comparePassword } = require('../helpers/auth');
// const axios = require('axios');

// // Test endpoint to check if the server is running


// // User registration
// const registerUser = async (req, res) => {
//     try {
//         const { name, email, password } = req.body;

//         // Validate input
//         if (!name || !email || !password || password.length < 6) {
//             return res.status(400).json({ error: 'Invalid input' });
//         }

//         // Check if the email already exists
//         const exist = await User.findOne({ email });
//         if (exist) {
//             return res.status(400).json({ error: 'Email is already taken!' });
//         }

//         // Hash the password
//         const hashedPassword = await hashPassword(password);

//         // Log hashed password for debugging (remove in production)
//         console.log('Hashed Password:', hashedPassword);

//         const user = await User.create({ name, email, password: hashedPassword });

//         // Exclude password from the response for security reasons
//         const { password: _, ...userWithoutPassword } = user.toObject();

//         return res.status(201).json(userWithoutPassword);
//     } catch (error) {
//         console.error('Registration error:', error); // Log the error
//         res.status(500).json({ error: 'Server error', details: error.message });
//     }
// };

// // User login
// // User login
// // User login
// const loginUser = async (req, res) => {
//     const { email, password, recaptchaToken } = req.body;

//     // Verify reCAPTCHA
//     const secretKey = process.env.RECAPTCHA_SECRET_KEY;
//     const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;
//     const response = await axios.post(verificationUrl);
//     const { success } = response.data;

//     if (!success) {
//         return res.status(400).json({ message: 'reCAPTCHA verification failed.' });
//     }

//     try {
//         // Find the user by email
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(401).json({ message: 'Invalid email or password.' });
//         }

//         // Check if the user is an admin
//         if (!user.isAdmin) {
//             return res.status(403).json({ message: 'Access denied. Admins only.' });
//         }

//         // Compare passwords
//         const isMatch = await comparePassword(password, user.password);
//         if (!isMatch) {
//             return res.status(401).json({ message: 'Invalid email or password.' });
//         }

//         // Exclude password from the response
//         const { password: _, ...userWithoutPassword } = user.toObject();
//         res.status(200).json({ message: 'Login successful!', user: userWithoutPassword });
//     } catch (error) {
//         console.error('Login error:', error);
//         res.status(500).json({ message: 'Internal server error.', details: error.message });
//     }
// };

// module.exports = {loginUser,};
