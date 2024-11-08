const express = require('express');
const router = express.Router();
const { archiveStudent, unarchiveStudent,importFromExcel } = require('../controllers/StudentArchive');

// Archive student by ID
router.put('/archive/:id', archiveStudent);

// Unarchive student by ID
router.put('/unarchive/:id', unarchiveStudent);

router.post('/import-excel', importFromExcel);

module.exports = router;