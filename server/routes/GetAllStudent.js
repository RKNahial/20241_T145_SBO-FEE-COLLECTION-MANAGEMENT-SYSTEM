// routes/studentRoutes.js
const express = require('express');
const router = express.Router();
const Student = require('../models/studentSchema');
const auth = require('../middleware/auth');

// GET all students with authentication
router.get('/', auth, async (req, res) => {
    try {
        // Query to find students who are either archived or not archived
        const students = await Student.find({ $or: [{ isArchived: false }, { isArchived: true }] });
        
        // Add console logging for successful retrieval
        console.log('\n--- Get All Students Request ---');
        console.log('Timestamp:', new Date().toISOString());
        console.log('Status: Success');
        console.log('User:', req.user);
        console.log('Total Students Retrieved:', students.length);
        console.log('Students:', JSON.stringify(students, null, 2));
        console.log('------------------------\n');

        res.json(students);
    } catch (error) {
        // Log error if request fails
        console.error('\n--- Get All Students Request Error ---');
        console.error('Timestamp:', new Date().toISOString());
        console.error('Status: Failed');
        console.error('Error:', error);
        console.error('------------------------\n');

        res.status(500).json({ message: 'Error fetching students', error });
    }
});

module.exports = router;
