const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const validateEmail = require('../middleware/emailValidator');

router.post('/users/register', validateEmail, userController.registerUser);
router.post('/users/admin/add', auth, userController.addAdmin);
router.post('/logout', userController.logout);

module.exports = router;