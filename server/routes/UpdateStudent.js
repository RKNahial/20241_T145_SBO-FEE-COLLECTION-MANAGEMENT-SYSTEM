const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const studentController = require('../controllers/StudentController');

// Add logging middleware
router.use((req, res, next) => {
    console.log('UpdateStudent Route Request:', {
        method: req.method,
        path: req.path,
        params: req.params,
        body: req.body,
        headers: req.headers
    });
    next();
});

router.get('/update/students/:id', auth, studentController.getStudentById);
router.put('/update/students/:id', auth, studentController.updateStudent);

module.exports = router;