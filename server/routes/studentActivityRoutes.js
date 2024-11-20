const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const ActivityLog = require('../models/ActivityLog');

// Get all students
router.get('/students', async (req, res) => {
  try {
    const students = await Student.find({ isArchived: false });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single student
router.get('/students/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create student
router.post('/students', async (req, res) => {
  try {
    const student = new Student(req.body);
    const newStudent = await student.save();

    // Log activity
    await ActivityLog.create({
      userId: req.user.id, // Assuming you have authentication
      action: 'create_student',
      details: `Created new student: ${student.name}`,
      targetId: newStudent._id,
      targetType: 'student',
      newData: req.body
    });

    res.status(201).json(newStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update student
router.put('/students/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const previousData = student.toObject();
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    // Log activity
    await ActivityLog.create({
      userId: req.user.id, // Assuming you have authentication
      action: 'update_student',
      details: `Updated student: ${student.name}`,
      targetId: student._id,
      targetType: 'student',
      previousData,
      newData: req.body
    });

    res.json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get activity logs for a student
router.get('/students/:id/logs', async (req, res) => {
  try {
    const logs = await ActivityLog.find({
      targetId: req.params.id,
      targetType: 'student'
    }).sort({ createdAt: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 