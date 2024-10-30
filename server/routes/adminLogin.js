const express = require('express');
const {  loginAdmin } = require('../controllers/loginAdmin');
const AdminLogin = express.Router();

AdminLogin.post('/', loginAdmin);

module.exports = AdminLogin;