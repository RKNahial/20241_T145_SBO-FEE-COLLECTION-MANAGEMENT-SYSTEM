const Student = require('../models/studentSchema');
const mongoose = require('mongoose');
const xlsx = require('xlsx');

class StudentArchiveService {
    async updateArchiveStatus(id, archiveStatus) {
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
            console.error('Error:', error);
        }
        console.log('------------------------\n');
    }

    async importFromExcel(fileBuffer) {
        const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(worksheet);

        if (data.length === 0) {
            throw new Error('Excel file is empty');
        }

        let successCount = 0;
        let errors = [];

        for (const row of data) {
            try {
                const studentData = await this.processExcelRow(row);
                if (studentData.error) {
                    errors.push(studentData.error);
                    continue;
                }

                await this.saveOrUpdateStudent(studentData);
                successCount++;
            } catch (err) {
                errors.push(`Error processing student: ${row['Student ID']} - ${err.message}`);
            }
        }

        return { successCount, errors };
    }

    async processExcelRow(row) {
        const studentId = row['Student ID']?.toString().trim();
        if (!studentId) {
            return { error: `Missing Student ID in row: ${JSON.stringify(row)}` };
        }

        const studentData = {
            studentId,
            name: row['Student Name']?.trim(),
            yearLevel: row['Year Level']?.trim(),
            program: row['Program']?.trim(),
            institutionalEmail: `${studentId}@student.buksu.edu.ph`.toLowerCase(),
            status: 'Active',
            isArchived: false,
            paymentstatus: 'Not Paid'
        };

        const missingFields = this.validateStudentData(studentData);
        if (missingFields.length > 0) {
            return { 
                error: `Missing fields for student ${studentId}: ${missingFields.join(', ')}` 
            };
        }

        return studentData;
    }

    validateStudentData(studentData) {
        const missingFields = [];
        if (!studentData.name) missingFields.push('Student Name');
        if (!studentData.yearLevel) missingFields.push('Year Level');
        if (!studentData.program) missingFields.push('Program');
        return missingFields;
    }

    async saveOrUpdateStudent(studentData) {
        const existingStudent = await Student.findOne({ 
            studentId: studentData.studentId 
        });

        if (existingStudent) {
            await Student.findByIdAndUpdate(existingStudent._id, studentData);
        } else {
            await Student.create(studentData);
        }
    }
}

module.exports = new StudentArchiveService(); 