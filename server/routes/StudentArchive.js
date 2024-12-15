const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { archiveStudent, unarchiveStudent } = require('../controllers/StudentArchive');

router.put('/archive/:id', auth, archiveStudent);
router.put('/unarchive/:id', auth, unarchiveStudent);

module.exports = router;