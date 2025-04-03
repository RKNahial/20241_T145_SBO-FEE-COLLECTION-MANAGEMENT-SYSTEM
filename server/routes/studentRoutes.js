const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const studentController = require('../controllers/StudentController');
const studentArchiveController = require('../controllers/StudentArchive');

// Lock-related routes
router.get('/students/:id/check-lock/:lockType', auth, studentController.checkLock);
router.post('/students/:id/acquire-lock/:lockType', auth, studentController.acquireLock);
router.delete('/students/:id/release-lock/:lockType', auth, studentController.releaseLock);
router.post('/students/clean-user-locks', auth, studentController.cleanUserLocks);

// Archive-related routes
router.put('/archive/:id', auth, studentArchiveController.archiveStudent);
router.put('/unarchive/:id', auth, studentArchiveController.unarchiveStudent);

// Other student routes
router.get('/students', auth, studentController.getAllStudents);
router.put('/students/:id', auth, studentController.updateStudent);
router.put('/students/:id/toggle-archive', studentController.toggleArchive);

module.exports = router; 