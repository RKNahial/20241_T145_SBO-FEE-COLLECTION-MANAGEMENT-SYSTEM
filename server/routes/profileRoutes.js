const express = require('express');
const router = express.Router();
const UserProfileController = require('../controllers/UserProfileController');


router.get('/:email/:position', UserProfileController.getProfile);
router.put('/:email/:position', UserProfileController.updateProfile);

module.exports = router; 