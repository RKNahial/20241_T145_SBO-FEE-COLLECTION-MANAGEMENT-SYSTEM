const express = require('express');
const router = express.Router();
const studentController = require('../controllers/Addstudent');
const auth = require('../middleware/auth');

// Route to add a new student
router.post('/add/students', auth, studentController.addStudent);

module.exports = router;
