const Student = require('../models/studentSchema');

class StudentService {
    async getAllStudents() {
        try {
            const students = await Student.find({ 
                $or: [{ isArchived: false }, { isArchived: true }] 
            });
            
            return {
                success: true,
                data: students,
                count: students.length
            };
        } catch (error) {
            throw new Error(`Error fetching students: ${error.message}`);
        }
    }

    async logStudentOperation(operation, data = null, error = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            operation,
            status: error ? 'Failed' : 'Success',
            data,
            error
        };
        
        console.log('\n---', operation, '---');
        console.log('Timestamp:', timestamp);
        console.log('Status:', logEntry.status);
        if (data) console.log('Data:', JSON.stringify(data, null, 2));
        if (error) console.error('Error:', error);
        console.log('------------------------\n');

        return logEntry;
    }
}

module.exports = new StudentService(); 