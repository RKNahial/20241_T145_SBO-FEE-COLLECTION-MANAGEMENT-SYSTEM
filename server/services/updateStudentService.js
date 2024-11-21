const Student = require('../models/studentSchema');

class UpdateStudentService {
    async validateInput(studentData) {
        const { studentId, name, yearLevel, program, institutionalEmail } = studentData;
        if (!studentId || !name || !yearLevel || !program || !institutionalEmail) {
            throw new Error('All fields are required');
        }
        return true;
    }

    async updateStudent(id, updateData) {
        console.log('Updating student with ID:', id);
        console.log('Update data:', updateData);

        const updatedStudent = await Student.findByIdAndUpdate(
            id,
            {
                studentId: updateData.studentId,
                name: updateData.name,
                yearLevel: updateData.yearLevel,
                program: updateData.program,
                institutionalEmail: updateData.institutionalEmail
            },
            { new: true, runValidators: true }
        );

        if (!updatedStudent) {
            console.log('Student not found with ID:', id);
            throw new Error('Student not found');
        }

        console.log('Student updated successfully:', updatedStudent);
        return updatedStudent;
    }
}

module.exports = new UpdateStudentService(); 