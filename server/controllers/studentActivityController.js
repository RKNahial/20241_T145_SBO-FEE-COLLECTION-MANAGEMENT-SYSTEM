const studentActivityService = require('../services/studentActivityService');

exports.getAllStudents = async (req, res) => {
    try {
        const students = await studentActivityService.getAllStudents();
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getStudent = async (req, res) => {
    try {
        const student = await studentActivityService.getStudentById(req.params.id);
        res.json(student);
    } catch (error) {
        if (error.message === 'Student not found') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

exports.createStudent = async (req, res) => {
    try {
        const newStudent = await studentActivityService.createStudent(req.body, req.user.id);
        res.status(201).json(newStudent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateStudent = async (req, res) => {
    try {
        const updatedStudent = await studentActivityService.updateStudent(
            req.params.id,
            req.body,
            req.user.id
        );
        res.json(updatedStudent);
    } catch (error) {
        if (error.message === 'Student not found') {
            return res.status(404).json({ message: error.message });
        }
        res.status(400).json({ message: error.message });
    }
};

exports.getStudentLogs = async (req, res) => {
    try {
        const logs = await studentActivityService.getStudentLogs(req.params.id);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 