const Student = require('../models/studentSchema');

// Function to add a new student
exports.addStudent = async (req, res) => {
    try {
        // Check if user is authenticated (req.user will be set by auth middleware)
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized access' });
        }

        const { name, studentId, institutionalEmail, yearLevel, program } = req.body;

        // Create a new student document
        const student = new Student({
            name,
            studentId,
            institutionalEmail,
            yearLevel,
            program,
        });

        // Save the student to the database
        await student.save();
        
        res.status(201).json({ message: 'Student added successfully' });
    } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).json({ message: 'Failed to add student', error: error.message });
    }
};
