const Student = require('../models/studentSchema');
const mongoose = require('mongoose');
const xlsx = require('xlsx');

// Helper function to update archive status
const updateArchiveStatus = async (id, archiveStatus, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid student ID' });
        }

        const student = await Student.findByIdAndUpdate(id, { isArchived: archiveStatus }, { new: true });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        console.log('\n--- Student Archive Status Update ---');
        console.log('Timestamp:', new Date().toISOString());
        console.log('Action:', archiveStatus ? 'Archive' : 'Unarchive');
        console.log('Student ID:', id);
        console.log('Student Name:', student.name);
        console.log('Status:', 'Success');
        console.log('------------------------\n');

        res.status(200).json({ message: `Student ${archiveStatus ? 'archived' : 'unarchived'} successfully`, student });
    } catch (error) {
        console.error('\n--- Student Archive Status Update Error ---');
        console.error('Timestamp:', new Date().toISOString());
        console.error('Error:', error);
        console.error('------------------------\n');
        
        res.status(500).json({ message: 'Server error', error });
    }
};

// Archive a student
exports.archiveStudent = async (req, res) => {
    const { id } = req.params;
    await updateArchiveStatus(id, true, res);
};

// Unarchive a student
exports.unarchiveStudent = async (req, res) => {
    const { id } = req.params;
    await updateArchiveStatus(id, false, res);
};

exports.importFromExcel = async (req, res) => {
    try {
        if (!req.files || !req.files['excel-file']) {
            return res.status(400).json({ error: 'No Excel file uploaded' });
        }

        const excelFile = req.files['excel-file'];
        const workbook = xlsx.read(excelFile.data, { type: 'buffer' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(worksheet);

        if (data.length === 0) {
            return res.status(400).json({ error: 'Excel file is empty' });
        }

        let successCount = 0;
        let errors = [];

        for (const row of data) {
            try {
                // Format student ID and create institutional email
                const studentId = row['Student ID']?.toString().trim();
                if (!studentId) {
                    errors.push(`Missing Student ID in row: ${JSON.stringify(row)}`);
                    continue;
                }

                const studentData = {
                    studentId: studentId,
                    name: row['Student Name']?.trim(),
                    yearLevel: row['Year Level']?.trim(),
                    program: row['Program']?.trim(),
                    institutionalEmail: `${studentId}@student.buksu.edu.ph`.toLowerCase(),
                    status: 'Active',
                    isArchived: false,
                    paymentstatus: 'Not Paid'
                };

                // Validate required fields
                const missingFields = [];
                if (!studentData.name) missingFields.push('Student Name');
                if (!studentData.yearLevel) missingFields.push('Year Level');
                if (!studentData.program) missingFields.push('Program');

                if (missingFields.length > 0) {
                    errors.push(`Missing fields for student ${studentId}: ${missingFields.join(', ')}`);
                    continue;
                }

                const existingStudent = await Student.findOne({ studentId: studentData.studentId });
                if (existingStudent) {
                    await Student.findByIdAndUpdate(existingStudent._id, studentData);
                } else {
                    await Student.create(studentData);
                }
                successCount++;
            } catch (err) {
                errors.push(`Error processing student: ${row['Student ID']} - ${err.message}`);
            }
        }

        res.json({
            message: `Successfully imported ${successCount} students${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        console.error('Import error:', error);
        res.status(500).json({ error: 'Error importing students from Excel. Please check your file format.' });
    }
};
