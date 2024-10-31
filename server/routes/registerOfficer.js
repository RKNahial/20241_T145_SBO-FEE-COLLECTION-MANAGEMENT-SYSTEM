const express = require('express');
const Officer = express.Router();
const { registerOfficer} = require ('../controllers/OfficerController');


Officer.post('/', registerOfficer); 

module.exports = Officer;