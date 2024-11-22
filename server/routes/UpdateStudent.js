const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const studentController = require('../controllers/StudentController');

router.get('/students/:id', auth, studentController.getStudentById);
router.put('/students/:id', auth, studentController.updateStudent);

module.exports = router;