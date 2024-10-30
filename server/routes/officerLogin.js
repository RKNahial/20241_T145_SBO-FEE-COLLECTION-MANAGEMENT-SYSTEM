const express = require('express');
const {  loginOfficer } = require('../controllers/loginOfficer');
const OfficerLogin = express.Router();

OfficerLogin.post('/', loginOfficer);

module.exports = OfficerLogin;