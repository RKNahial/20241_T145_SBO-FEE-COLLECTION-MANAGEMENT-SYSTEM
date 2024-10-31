const express = require('express');
const { archiveOfficer } = require('../controllers/officersArchive');

const router = express.Router();

// Route to archive an officer
router.post('/archive-officer/:id', async (req, res) => {
    const officerId = req.params.id;
    const { reason } = req.body;

    const result = await archiveOfficer(officerId, reason);
    res.json(result);
});

module.exports = router;
