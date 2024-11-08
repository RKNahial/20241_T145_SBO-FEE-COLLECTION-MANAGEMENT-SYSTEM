// routes/studentRoutes.js
const express = require('express');
const router = express.Router();
const Student = require('../models/studentSchema');

// GET all students (excluding archived)
router.get('/', async (req, res) => {
    try {
        // Query to find students who are either archived or not archived (i.e., all students)
        const students = await Student.find({ $or: [{ isArchived: false }, { isArchived: true }] });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching students', error });
    }
});

module.exports = router;
