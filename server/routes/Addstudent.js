const express = require('express');
const router = express.Router();
const studentController = require('../controllers/Addstudent');
const auth = require('../middleware/auth');

// Route to add a new student
router.post('/add/students', auth, (req, res, next) => {
    // Log request details
    console.log('\n--- New Student Addition Request ---');
    console.log('Time:', new Date().toISOString());
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('User:', req.user);
    
    studentController.addStudent(req, res)
        .then(result => {
            // Log response details
            console.log('\n--- Response ---');
            console.log('Status:', res.statusCode);
            console.log('Response Body:', result);
            console.log('------------------------\n');
        })
        .catch(error => {
            // Log error details
            console.log('\n--- Error ---');
            console.log('Error:', error);
            console.log('------------------------\n');
            next(error);
        });
});

module.exports = router;
