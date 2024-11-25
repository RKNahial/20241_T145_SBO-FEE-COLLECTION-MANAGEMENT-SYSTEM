const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.post('/users/register', userController.registerUser);
router.post('/users/admin/add', auth, userController.addAdmin);
router.post('/logout', userController.logout);

module.exports = router;