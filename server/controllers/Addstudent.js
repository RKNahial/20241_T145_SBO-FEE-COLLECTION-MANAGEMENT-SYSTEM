const Student = require('../models/studentSchema');
const loggingService = require('../services/loggingService');

// Function to add a new student
exports.addStudent = async (req, res, next) => {
    try {
        // Log request details
        console.log('\n--- New Student Addition Request ---');
        console.log('Time:', new Date().toISOString());
        console.log('Headers:', req.headers);
        console.log('Body:', req.body);
        console.log('User:', req.user);

        // Check if user is authenticated
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
        
        // Create log entry
        await loggingService.createLog({
            userName: req.user.name,
            userEmail: req.user.email,
            userPosition: 'Treasurer',
            action: 'ADD_STUDENT',
            details: `Added new student: ${name} (${studentId})`,
            metadata: {
                studentId: student._id,
                studentDetails: {
                    name,
                    studentId,
                    yearLevel,
                    program
                }
            }
        });

        // Log response details
        console.log('\n--- Response ---');
        console.log('Status:', res.statusCode);
        console.log('Response Body:', { message: 'Student added successfully' });
        console.log('------------------------\n');

        res.status(201).json({ message: 'Student added successfully' });
    } catch (error) {
        // Log error details
        console.log('\n--- Error ---');
        console.log('Error:', error);
        console.log('------------------------\n');
        
        console.error('Error adding student:', error);
        res.status(500).json({ message: 'Failed to add student', error: error.message });
        next(error);
    }
};
