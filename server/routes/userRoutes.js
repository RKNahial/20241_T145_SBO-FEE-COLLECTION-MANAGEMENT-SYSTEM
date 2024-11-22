const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/users/register', userController.registerUser);
router.post('/users/admin/add', userController.addAdmin);
router.post('/logout', userController.logout);

module.exports = router;