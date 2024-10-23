const express = require('express');
const ADMIN_ROUTES = express.Router();
const AdminModel = require('../models/AdminModel'); // Adjust the path if needed
const bcrypt = require('bcrypt'); // For password hashing comparison
const { RecaptchaV2 } = require('express-recaptcha');

// Initialize reCAPTCHA with your site and secret keys
const recaptcha = new RecaptchaV2('6LeZHWkqAAAAACelXEagXWJuTnWLn-1vjv41y6lx', '6LeZHWkqAAAAAJQDndi_uHvgAmquL1hPG2DvaS4d');

// POST route for admin login
ADMIN_ROUTES.post('/login', recaptcha.middleware.verify, async (req, res) => {
  const { username, password } = req.body;
  if (req.recaptcha.error) {
    return res.render('login', { message: 'Invalid reCAPTCHA response' });
  }
  try {
    // Check if username and password are provided
    if (!username || !password) {
      return res.render('login', { message: 'Username and password are required' });
    }

    // Find the admin by username
    const admin = await AdminModel.findOne({ username });
    if (!admin) {
      return res.render('login.ejs', { message: 'Admin not found' });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (isMatch) {
      // Successful login
      res.status(200).json({ message: 'Login successful', admin });
    } else {
      // Incorrect password
      return res.render('login', { message: 'Invalid credentials' });
    }
  } catch (err) {
    res.render('login', { message: 'Server error. Please try again later.' });
  }
}),
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