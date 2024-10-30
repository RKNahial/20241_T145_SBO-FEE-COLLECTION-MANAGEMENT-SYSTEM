const express = require('express');
const Officer = express.Router();
const { registerOfficer} = require ('../controllers/registerOfficer');


Officer.post('/', registerOfficer); 

module.exports = Officer;