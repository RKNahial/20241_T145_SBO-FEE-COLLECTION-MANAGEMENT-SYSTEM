const express = require('express');
const router = express.Router();
const studentController = require('../controllers/Addstudent');

// Route to add a new student
router.post('/add/students', studentController.addStudent);

module.exports = router;
