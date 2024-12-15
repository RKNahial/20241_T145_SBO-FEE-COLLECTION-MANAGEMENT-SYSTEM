const mongoose = require('mongoose');

const archivedOfficerSchema = new mongoose.Schema({
    studentID: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    position: { type: String, required: true },
    archived_date: { type: Date, default: Date.now },  // Date when officer was archived
    archived_reason: { type: String }  // Reason for archiving
}, { collection: 'archived_officers' });

// Export the model with a name 'ArchivedOfficer'
module.exports = mongoose.model('ArchivedOfficer', archivedOfficerSchema);
