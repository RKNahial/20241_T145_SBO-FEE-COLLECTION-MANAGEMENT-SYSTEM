const Student = require('../models/studentSchema');

// Archive a student
exports.archiveStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Student.findByIdAndUpdate(id, { isArchived: true }, { new: true });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json({ message: `${student.name} has been archived`, student });
    } catch (error) {
        res.status(500).json({ message: 'Error archiving student', error });
    }
};

// Unarchive a student
exports.unarchiveStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Student.findByIdAndUpdate(id, { isArchived: false }, { new: true });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json({ message: `${student.name} has been unarchived`, student });
    } catch (error) {
        res.status(500).json({ message: 'Error unarchiving student', error });
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
