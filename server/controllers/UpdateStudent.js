const Student = require('../models/studentSchema');

const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { studentId, name, yearLevel, program, institutionalEmail } = req.body;

        console.log('Updating student with ID:', id);
        console.log('Update data:', req.body);

        // Validate input
        if (!studentId || !name || !yearLevel || !program || !institutionalEmail) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Find student and update with all fields
        const updatedStudent = await Student.findByIdAndUpdate(
            id,
            {
                studentId,
                name,
                yearLevel,
                program,
                institutionalEmail
            },
            { new: true, runValidators: true }
        );

        if (!updatedStudent) {
            console.log('Student not found with ID:', id);
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        console.log('Student updated successfully:', updatedStudent);

        res.status(200).json({
            success: true,
            message: 'Student updated successfully',
            data: updatedStudent
        });

    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating student',
            error: error.message
        });
    }
};

module.exports = { updateStudent };