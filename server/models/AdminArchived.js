const archivedAdminSchema = new mongoose.Schema({
    adminID: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    archived_date: { type: Date, default: Date.now },  // Date when admin was archived
    archived_reason: { type: String }  // Reason for archiving
}, { collection: 'archived_admins' });


module.exports = mongoose.model ('Admin', ArchivedAdmin );