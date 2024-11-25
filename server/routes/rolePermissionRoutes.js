const express = require('express');
const router = express.Router();
const rolePermissionController = require('../controllers/rolePermissionController');
const authMiddleware = require('../middleware/authMiddleware');

router.put('/permissions/:userId', authMiddleware, rolePermissionController.updatePermissions);
router.get('/permissions/:userId', authMiddleware, rolePermissionController.getPermissions);

module.exports = router;