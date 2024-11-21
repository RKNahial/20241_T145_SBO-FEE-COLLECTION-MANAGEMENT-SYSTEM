const updateStudentService = require('../services/updateStudentService');

const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate input
        await updateStudentService.validateInput(req.body);

        // Update student
        const updatedStudent = await updateStudentService.updateStudent(id, req.body);

        res.status(200).json({
            success: true,
            message: 'Student updated successfully',
            data: updatedStudent
        });

    } catch (error) {
        console.error('Error updating student:', error);
        
        if (error.message === 'All fields are required') {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        if (error.message === 'Student not found') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error updating student',
            error: error.message
        });
    }
};

module.exports = { updateStudent };