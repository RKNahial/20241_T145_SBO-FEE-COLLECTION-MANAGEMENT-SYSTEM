const express = require('express');
const {  loginOfficer } = require('../controllers/OfficerController');
const OfficerLogin = express.Router();

OfficerLogin.post('/', loginOfficer);

module.exports = OfficerLogin;