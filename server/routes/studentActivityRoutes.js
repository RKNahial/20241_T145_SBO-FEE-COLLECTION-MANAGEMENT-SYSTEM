const express = require('express');
const router = express.Router();
const studentActivityController = require('../controllers/studentActivityController');

// Student routes
router.get('/students', studentActivityController.getAllStudents);
router.get('/students/:id', studentActivityController.getStudent);
router.post('/students', studentActivityController.createStudent);
router.put('/students/:id', studentActivityController.updateStudent);
router.get('/students/:id/logs', studentActivityController.getStudentLogs);

module.exports = router; 