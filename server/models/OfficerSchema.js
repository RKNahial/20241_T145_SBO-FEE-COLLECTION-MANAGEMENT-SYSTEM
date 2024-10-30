const mongoose = require('mongoose');

const officerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
}, { collection: 'officers' });

module.exports = mongoose.model('Officer', officerSchema);
