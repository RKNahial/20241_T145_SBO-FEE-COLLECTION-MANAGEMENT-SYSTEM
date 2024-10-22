const express = require('express');
const ADMIN_ROUTES = express.Router();
const AdminModel = require('../models/AdminModel'); // Adjust the path if needed
const bcrypt = require('bcrypt'); // For password hashing comparison
const Recaptcha = require('express-recaptcha').RecaptchaV2;

// Initialize reCAPTCHA with your site and secret keys
const recaptcha = new Recaptcha('6LeZHWkqAAAAACelXEagXWJuTnWLn-1vjv41y6lx', '6LeZHWkqAAAAAJQDndi_uHvgAmquL1hPG2DvaS4d');

// POST route for admin login
ADMIN_ROUTES.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const recaptchaResponse = req.body['g-recaptcha-response'];

  try {
    // Verify reCAPTCHA response
    const recaptchaVerified = await recaptcha.verify(recaptchaResponse, req.ip);
    if (!recaptchaVerified) {
      return res.status(401).send('Invalid reCAPTCHA response');
    }

    // Check if username and password are provided
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find the admin by username
    const admin = await AdminModel.findOne({ username });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (isMatch) {
      // Successful login
      res.status(200).json({ message: 'Login successful', admin });
    } else {
      // Incorrect password
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
})

// POST route for adding a new admin
ADMIN_ROUTES.post('/add', (req, res) => {
  const { last_name, first_name, middle_name, email, password } = req.body;

  // Create a new admin instance
  const newAdmin = new AdminModel({
    last_name,
    first_name,
    middle_name,
    email,
    password: bcrypt.hashSync(password, 10) // Hashing the password before saving
  });

  // Save the new admin to the database
  newAdmin.save()
    .then(() => res.status(201).json({ message: 'Admin created successfully!' }))
    .catch((err) => res.status(500).json({ message: 'Error creating admin', error: err }));
});


    
        // Error handling for invalid login
    ADMIN_ROUTES.post('/admin/login/invalid', (req, res) => {
    });
    
        // Add officer information
    ADMIN_ROUTES.post('/admin/manage-sbo-officers/add-new', (req, res) => {
    });
    
        // Get all officers
    ADMIN_ROUTES.get('/admin/manage-sbo-officers/all', (req, res) => {
    });
    
        // Get officer by ID
    ADMIN_ROUTES.get('/admin/manage-sbo-officers/search/i/:id', (req, res) => {
    });
    
        // Get officer by name
    ADMIN_ROUTES.get('/admin/manage-sbo-officers/search/n/:name', (req, res) => {
    });
    
    // Update officer information
    ADMIN_ROUTES.patch('/admin/manage-sbo-officers/edit/:id', (req, res) => {
    });
    
        // Archive officer
    ADMIN_ROUTES.patch('/admin/manage-sbo-officers/archive/:id', (req, res) => {
    });
    
        // Disable officer account
    ADMIN_ROUTES.patch('/admin/manage-sbo-officers/disable/:id', (req, res) => {
    });
    
        // Add student information
    ADMIN_ROUTES.post('/admin/students/add-new', (req, res) => {
    });
    
        // Get all students
    ADMIN_ROUTES.get('/admin/students/all', (req, res) => {
    });
    
        // Get student by ID
    ADMIN_ROUTES.get('/admin/students/search/i/:id', (req, res) => {
    });
    
        // Get student by name
    ADMIN_ROUTES.get('/admin/students/search/n/:name', (req, res) => {
    });
    
        // Update student information
    ADMIN_ROUTES.patch('/admin/students/edit/:id', (req, res) => {
    });
    
        // Archive student
    ADMIN_ROUTES.patch('/admin/students/archive/:id', (req, res) => {
    });
    
        // Import students from Excel file
    ADMIN_ROUTES.post('/admin/student/import-excel', (req, res) => {
    });
    
        // Create new school year
    ADMIN_ROUTES.post('/admin/school-year/add-new', (req, res) => {
    });
    
        // Choose semester
    ADMIN_ROUTES.post('/admin/school-year/semester', (req, res) => {
    });
    
        // Display error notifications for officers
    ADMIN_ROUTES.get('/admin/manage-sbo-officers/error', (req, res) => {
    });
    
        // Admin Logout
    ADMIN_ROUTES.post('/admin/logout', (req, res) => {
    });
    
module.exports = ADMIN_ROUTES;