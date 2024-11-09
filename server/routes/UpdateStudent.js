const express = require('express');
const router = express.Router();
const { updateStudent } = require('../controllers/UpdateStudent');

// Update student route
router.put('/students/:id', updateStudent);

module.exports = router;