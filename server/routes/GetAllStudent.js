// routes/studentRoutes.js
const express = require('express');
const router = express.Router();
const studentController = require('../controllers/StudentController');
const auth = require('../middleware/auth');

// GET all students with authentication
router.get('/getAll/students', auth, studentController.getAllStudents);

module.exports = router;
