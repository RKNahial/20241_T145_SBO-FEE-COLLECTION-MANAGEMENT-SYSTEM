const studentService = require('../services/studentService');

exports.getAllStudents = async (req, res) => {
    try {
        const result = await studentService.getAllStudents();
        
        // Log the successful operation
        await studentService.logStudentOperation('Get All Students Request', {
            user: req.user,
            totalStudents: result.count,
            students: result.data
        });

        res.json(result.data);
    } catch (error) {
        // Log the failed operation
        await studentService.logStudentOperation('Get All Students Request', null, error);
        
        res.status(500).json({ 
            message: 'Error fetching students', 
            error: error.message 
        });
    }
}; 