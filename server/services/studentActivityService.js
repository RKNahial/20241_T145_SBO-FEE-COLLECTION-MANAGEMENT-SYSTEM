const Student = require('../models/Student');
const ActivityLog = require('../models/ActivityLog');

class StudentActivityService {
    async getAllStudents() {
        return await Student.find({ isArchived: false });
    }

    async getStudentById(id) {
        const student = await Student.findById(id);
        if (!student) {
            throw new Error('Student not found');
        }
        return student;
    }

    async createStudent(studentData, userId) {
        const student = new Student(studentData);
        const newStudent = await student.save();

        await this.logStudentActivity({
            userId,
            action: 'create_student',
            details: `Created new student: ${student.name}`,
            targetId: newStudent._id,
            targetType: 'student',
            newData: studentData
        });

        return newStudent;
    }

    async updateStudent(id, updateData, userId) {
        const student = await this.getStudentById(id);
        const previousData = student.toObject();
        
        const updatedStudent = await Student.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        await this.logStudentActivity({
            userId,
            action: 'update_student',
            details: `Updated student: ${student.name}`,
            targetId: student._id,
            targetType: 'student',
            previousData,
            newData: updateData
        });

        return updatedStudent;
    }

    async getStudentLogs(studentId) {
        return await ActivityLog.find({
            targetId: studentId,
            targetType: 'student'
        }).sort({ createdAt: -1 });
    }

    async logStudentActivity(logData) {
        return await ActivityLog.create(logData);
    }
}

module.exports = new StudentActivityService(); 