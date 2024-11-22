const mongoose = require('mongoose');
const Student = require('../models/Student');

class StudentArchiveService {
    async updateArchiveStatus(id, archiveStatus) {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error('Invalid student ID');
            }

            const student = await Student.findByIdAndUpdate(
                id, 
                { isArchived: archiveStatus }, 
                { new: true }
            );

            if (!student) {
                throw new Error('Student not found');
            }

            this.logArchiveOperation(student, archiveStatus);
            return student;
        } catch (error) {
            this.logArchiveOperation(null, archiveStatus, error);
            throw error;
        }
    }

    logArchiveOperation(student, archiveStatus, error = null) {
        const timestamp = new Date().toISOString();
        if (!error) {
            console.log('\n--- Student Archive Status Update ---');
            console.log('Timestamp:', timestamp);
            console.log('Action:', archiveStatus ? 'Archive' : 'Unarchive');
            console.log('Student ID:', student._id);
            console.log('Student Name:', student.name);
            console.log('Status: Success');
        } else {
            console.error('\n--- Student Archive Status Update Error ---');
            console.error('Timestamp:', timestamp);
            console.error('Error:', error.message);
        }
        console.log('------------------------\n');
    }
}

module.exports = new StudentArchiveService(); 