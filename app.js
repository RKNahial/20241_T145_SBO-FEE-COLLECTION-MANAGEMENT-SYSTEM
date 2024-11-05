const express = require('express');
const app = express();

// Admin Routes
    // Admin Login
    app.post('/admin/login', (req, res) => {});

    // Add officer information
    app.post('/admin/manage-sbo-officers/add-new', (req, res) => {});

    // Get all officers
    app.get('/admin/manage-sbo-officers/all', (req, res) => {});

    // Get officer by ID
    app.get('/admin/manage-sbo-officers/search/i/:id', (req, res) => {});

    // Get officer by name
    app.get('/admin/manage-sbo-officers/search/n/:name', (req, res) => {});

    // Update officer information
    app.patch('/admin/manage-sbo-officers/edit/:id', (req, res) => {});

    // Archive officer
    app.patch('/admin/manage-sbo-officers/archive/:id', (req, res) => {});

    // Disable officer account
    app.patch('/admin/manage-sbo-officers/disable/:id', (req, res) => {});

    // Add student information
    app.post('/admin/students/add-new', (req, res) => {});

// Governor Routes
    // Governor Login
    app.post('/governor/login', (req, res) => {});

    // Add officer information
    app.post('/governor/manage-sbo-officers/add-new', (req, res) => {});

    // Get all officers
    app.get('/governor/manage-sbo-officers/all', (req, res) => {});

    // Get officer by ID
    app.get('/governor/manage-sbo-officers/search/i/:id', (req, res) => {});

    // Get officer by name
    app.get('/governor/manage-sbo-officers/search/n/:name', (req, res) => {});

    // Update officer information
    app.patch('/governor/manage-sbo-officers/edit/:id', (req, res) => {});

    // Archive officer
    app.patch('/governor/manage-sbo-officers/archive/:id', (req, res) => {});

    // Disable officer account
    app.patch('/governor/manage-sbo-officers/disable/:id', (req, res) => {});

    // Add student information
    app.post('/governor/students/add-new', (req, res) => {});

// Officer Routes
    // Officer Login
    app.post('/officer/login', (req, res) => {});

    // Add student information
    app.post('/officer/students/add-new', (req, res) => {});

    // Get all students
    app.get('/officer/students/all', (req, res) => {});

    // Get student by ID
    app.get('/officer/students/search/i/:id', (req, res) => {});

    // Get student by name
    app.get('/officer/students/search/n/:name', (req, res) => {});

    // Update student information
    app.patch('/officer/students/edit/:id', (req, res) => {});

    // Archive student
    app.patch('/officer/students/archive/:id', (req, res) => {});

    // Import students from Excel file
    app.post('/officer/students/import-excel', (req, res) => {});

// Treasurer Routes
    // Treasurer Login
    app.post('/treasurer/login', (req, res) => {});

    // Add student information
    app.post('/treasurer/students/add-new', (req, res) => {});

    // Get all students
    app.get('/treasurer/students/all', (req, res) => {});

    // Get student by ID
    app.get('/treasurer/students/search/i/:id', (req, res) => {});

    // Get student by name
    app.get('/treasurer/students/search/n/:name', (req, res) => {});

    // Update student information
    app.patch('/treasurer/students/edit/:id', (req, res) => {});

    // Archive student
    app.patch('/treasurer/students/archive/:id', (req, res) => {});

    // Import students from Excel file
    app.post('/treasurer/students/import-excel', (req, res) => {});

    // Generate reports
    app.get('/treasurer/reports/generate', (req, res) => {});

    // Download reports
    app.get('/treasurer/reports/download', (req, res) => {});

    // Record student payment
    app.post('/treasurer/manage-fee/:id', (req, res) => {});

    // View and generate receipts
    app.get('/treasurer/manage-fee/receipt/:id', (req, res) => {});

    // Collect daily dues
    app.post('/treasurer/daily-dues/:id', (req, res) => {});

    // Collect daily dues in amount
    app.post('/treasurer/daily-dues/amount/:id', (req, res) => {});

    // Attach Google Notes
    app.post('/treasurer/students/notes/:id', (req, res) => {});

    // Treasurer Logout
    app.post('/treasurer/logout', (req, res) => {});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});