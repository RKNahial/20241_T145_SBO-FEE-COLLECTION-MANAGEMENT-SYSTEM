const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Route for user login and logout
router.post('/login', async (req, res) => {
    try {
        const user = await userController.login(req, res);

        // Log the login activity
        await logActivity(user, 'login', `User ${user.name} logged in`);

        res.json({ token, user });
    } catch (error) {
        // ... error handling ...
    }
});
router.post('/logout', userController.logout);

module.exports = router;