const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: true }
}, { collection: 'admins' }); // Explicitly set collection name

module.exports = mongoose.model('Admin', adminSchema);
