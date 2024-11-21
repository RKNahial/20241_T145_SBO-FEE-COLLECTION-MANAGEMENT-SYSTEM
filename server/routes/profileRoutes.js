const express = require('express');
const router = express.Router();
const UserProfileController = require('../controllers/UserProfileController');


router.get('/profile/:email/:position', UserProfileController.getProfile);
router.put('/profile/:email/:position', UserProfileController.updateProfile);

module.exports = router; 