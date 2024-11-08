const Student = require('../models/studentSchema');
const mongoose = require('mongoose');

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

        res.status(200).json({ message: `Student ${archiveStatus ? 'archived' : 'unarchived'} successfully`, student });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Archive a student
exports.archiveStudent = async (req, res) => {
    const { id } = req.params;
    const student = await updateArchiveStatus(id, true, res);
    if (student) {
        res.json({ message: `${student.name} has been archived`, student });
    }
};

// Unarchive a student
exports.unarchiveStudent = async (req, res) => {
    const { id } = req.params;
    const student = await updateArchiveStatus(id, false, res);
    if (student) {
        res.json({ message: `${student.name} has been unarchived`, student });
    }
};


exports.importFromExcel = async (req, res) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const excelFile = req.files['excel-file'];
        const workbook = xlsx.read(excelFile.data, { type: 'buffer' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(worksheet);

        // Process the data and create/update students
        for (const student of data) {
            const { name, studentId, institutionalEmail, yearLevel, program } = student;
            const existingStudent = await Student.findOne({ studentId });

            if (existingStudent) {
                await Student.findByIdAndUpdate(existingStudent._id, { name, institutionalEmail, yearLevel, program });
            } else {
                await Student.create({ name, studentId, institutionalEmail, yearLevel, program });
            }
        }

        res.json({ message: `${data.length} students imported successfully` });
    } catch (error) {
        res.status(500).json({ error: 'Error importing students from Excel' });
    }
};
