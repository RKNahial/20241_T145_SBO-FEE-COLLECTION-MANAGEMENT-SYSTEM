const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    studentId: {
        type: String, // or Number, based on your preference
        required: true
    },
    institutionalEmail: {
        type: String,
        required: true
    },
    yearLevel: {
        type: String, // or Number, depending on the format of the year level (e.g., Freshman, Sophomore)
        required: true
    },
    program: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'Active' // Default status
    }
});

module.exports = mongoose.model('Student', studentSchema);
