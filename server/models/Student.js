const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  institutionalEmail: {
    type: String,
    required: true,
    unique: true
  },
  yearLevel: {
    type: String,
    required: true
  },
  program: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'Active'
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  paymentstatus: {
    type: String,
    default: 'Not Paid'
  }
}, { timestamps: true });

const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);

module.exports = mongoose.models.Student; 