const User = require('../models/OfficerSchema');
const { comparePassword, hashPassword } = require('../helpers/authOfficer');
const axios = require('axios');

const loginOfficerService = async (email, password, recaptchaToken) => {
    // Verify reCAPTCHA
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;
    
    const recaptchaResponse = await axios.post(verificationUrl);
    if (!recaptchaResponse.data.success) {
        return { status: 400, data: { message: 'reCAPTCHA verification failed.' } };
    }

    const user = await User.findOne({ email });
    if (!user) {
        return { status: 401, data: { message: 'Invalid email or password.' } };
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
        return { status: 401, data: { message: 'Invalid email or password.' } };
    }

    const { password: _, ...userWithoutPassword } = user.toObject();
    return { status: 200, data: { message: 'Login successful!', user: userWithoutPassword } };
};

const registerOfficerService = async ({ studentID, name, email, password, position }) => {
    // Validate input
    if (!studentID || !name || !email || !password || !position || password.length < 6) {
        throw new Error('Invalid input');
    }

    const exist = await User.findOne({ email });
    if (exist) {
        throw new Error('Email is already taken!');
    }

    const hashedPassword = await hashPassword(password);

    // Create a new officer
    const user = await User.create({ studentID, name, email, password: hashedPassword, position });

    const { password: _, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
};

module.exports = { loginOfficerService, registerOfficerService };
