const express = require('express');
const router = express.Router();
const rolePermissionController = require('../controllers/rolePermissionController');
const auth = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

router.put('/permissions/:userId', rolePermissionController.updatePermissions);
router.get('/permissions/:userId', rolePermissionController.getPermissions);

module.exports = router;