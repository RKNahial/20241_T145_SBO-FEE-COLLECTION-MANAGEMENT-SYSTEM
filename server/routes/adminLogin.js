const express = require('express');
const {  loginAdmin } = require('../controllers/AdminController');
const AdminLogin = express.Router();

AdminLogin.post('/', loginAdmin);

module.exports = AdminLogin;