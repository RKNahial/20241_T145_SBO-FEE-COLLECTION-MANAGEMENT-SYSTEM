const Admin = require('../models/AdminSchema');
const { comparePassword, hashPassword } = require('../helpers/authAdmin');
const axios = require('axios');

const loginAdminService = async (email, password, recaptchaToken) => {
    // Verify reCAPTCHA
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;
    const response = await axios.post(verificationUrl);
    const { success } = response.data;

    if (!success) {
        return { status: 400, data: { message: 'reCAPTCHA verification failed.' } };
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
        return { status: 401, data: { message: 'Invalid email or password.' } };
    }

    if (!admin.isAdmin) {
        return { status: 403, data: { message: 'Access denied. Admins only.' } };
    }

    const isMatch = await comparePassword(password, admin.password);
    if (!isMatch) {
        return { status: 401, data: { message: 'Invalid email or password.' } };
    }

    const { password: _, ...adminWithoutPassword } = admin.toObject();
    return { status: 200, data: { message: 'Login successful!', admin: adminWithoutPassword } };
};

const registerUserService = async ({ name, email, password, isAdmin }) => {
    // Validate input
    if (!name || !email || !password || password.length < 6) {
        throw new Error('Invalid input');
    }

    // Check if the email already exists
    const exist = await Admin.findOne({ email });
    if (exist) {
        throw new Error('Email is already taken!');
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);
    
    // Create user
    const user = await Admin.create({
        name,
        email,
        password: hashedPassword,
        isAdmin: isAdmin !== undefined ? isAdmin : true // Default to true if undefined
    });

    const { password: _, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
};

module.exports = { loginAdminService, registerUserService };
