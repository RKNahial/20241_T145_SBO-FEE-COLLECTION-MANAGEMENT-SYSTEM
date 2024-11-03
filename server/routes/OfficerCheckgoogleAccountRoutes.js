const express = require('express');
const router = express.Router();
const { checkOfficerGoogleAccount } = require('../controllers/OfficerCheckGoogleAccountController');

router.post('/', checkOfficerGoogleAccount);

module.exports = router;
