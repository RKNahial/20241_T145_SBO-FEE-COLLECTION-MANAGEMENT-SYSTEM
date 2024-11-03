// routes/officerRoutes.js
const express = require('express');
const { verifyTreasurerUser } = require('../services/TreasurerGoogle'); 
const router = express.Router();

// Endpoint to verify Treasurer officer
router.post('/verify-treasurer', async (req, res) => {
    try {
        const { email } = req.body;
        const result = await verifyTreasurerUser(email);
        res.json(result);
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
