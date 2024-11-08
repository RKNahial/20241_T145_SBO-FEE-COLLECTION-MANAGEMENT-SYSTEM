// routes/studentRoutes.js
const express = require('express');
const router = express.Router();
const Student = require('../models/studentSchema');

// GET all students (excluding archived)
router.get('/', async (req, res) => {
    try {
        const students = await Student.find({ isArchived: false });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching students', error });
    }
});

// POST a new student


// PUT archive a student by ID
router.put('/archive/:id_no', async (req, res) => {
    try {
        const student = await Student.findOneAndUpdate(
            { id_no: req.params.id_no },
            { isArchived: true },
            { new: true }
        );
        if (student) {
            res.json({ message: `${student.name} has been archived`, student });
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error archiving student', error });
    }
});

module.exports = router;
