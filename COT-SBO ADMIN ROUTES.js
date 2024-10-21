const express = require('express');
const ADMIN_ROUTES = express.Router();

// D. COT-SBO ADMIN ROUTES
    // Admin Login
    ADMIN_ROUTES.post('/admin/login', (req, res) => {
    });
    
        // ADMIN_ROUTES APPly reCAPTCHA
    ADMIN_ROUTES.post('/admin/login/recaptcha', (req, res) => {
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