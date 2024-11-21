const express = require('express');
const router = express.Router();
const { registerUser, addAdmin } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/users/register', registerUser);
router.post('/users/admin/add', authMiddleware, addAdmin);

module.exports = router;