// routes/registerAdmin.js
const express = require('express');
const { registerUser } = require('../controllers/AdminController'); // Ensure controller exists and is imported correctly
const AdminRegister = express.Router();

// Define register route without repeating '/registerStud'
AdminRegister.post('/', registerUser);

module.exports = AdminRegister;
