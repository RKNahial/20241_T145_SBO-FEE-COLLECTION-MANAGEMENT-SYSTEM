const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const officerSchema = new mongoose.Schema({
    ID: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    position: { type: String, required: true },
    password: { type: String, required: true },
    isArchived: { type: Boolean, default: false },
    archivedAt: { type: Date }
});

officerSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Officer', officerSchema);

