const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    studentId: { type: String, required: true, unique: true },
    institutionalEmail: { type: String, required: true, unique: true },
    yearLevel: { type: String, required: true },
    program: { type: String, required: true },
    status: { type: String, default: 'Active' },
    isArchived: { type: Boolean, default: false } ,
    paymentstatus: { type: String, default: 'Not Paid' } // Add this field
});

module.exports = mongoose.model('Student', studentSchema);
