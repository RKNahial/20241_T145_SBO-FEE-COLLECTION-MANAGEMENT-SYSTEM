const studentService = require('../services/studentService');
const Student = require('../models/studentSchema');
const loggingService = require('../services/loggingService');
const HistoryLog = require('../models/HistoryLog');
const resourceLockService = require('../services/resourceLockService');

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

exports.updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const previousData = updateData.previousData;
        
        // Remove non-student fields before update
        delete updateData.userName;
        delete updateData.userEmail;
        delete updateData.userPosition;
        delete updateData.userId;
        delete updateData.previousData;

        const updatedStudent = await Student.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Create history log using auth middleware user info
        await HistoryLog.create({
            userName: req.user.name,
            userEmail: req.user.email,
            userPosition: req.user.position,
            action: 'UPDATE_STUDENT',
            details: `${req.user.name} (${req.user.position}) updated student: ${updatedStudent.name}`,
            metadata: {
                studentId: id,
                previousData: previousData,
                newData: updatedStudent.toObject(),
                changes: Object.keys(updateData).reduce((acc, key) => {
                    if (previousData[key] !== updateData[key]) {
                        acc[key] = {
                            from: previousData[key],
                            to: updateData[key]
                        };
                    }
                    return acc;
                }, {})
            }
        });

        res.json({
            success: true,
            message: 'Student updated successfully',
            student: updatedStudent
        });
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error updating student', 
            error: error.message 
        });
    }
};

exports.checkEditLock = async (req, res) => {
    try {
        const { id } = req.params;
        const lockStatus = await resourceLockService.checkLock(id, 'EDIT');
        res.json(lockStatus);
    } catch (error) {
        console.error('Error checking lock:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error checking lock status' 
        });
    }
};

exports.checkLock = async (req, res) => {
    try {
        const { id, lockType } = req.params;
        
        if (!['EDIT', 'ARCHIVE'].includes(lockType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid lock type'
            });
        }

        const lockStatus = await resourceLockService.checkLock(id, lockType);
        res.json(lockStatus);
    } catch (error) {
        console.error('Error checking lock:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error checking lock status' 
        });
    }
};

exports.acquireLock = async (req, res) => {
    try {
        const { id, lockType } = req.params;
        const lockResult = await resourceLockService.acquireLock(
            id,
            req.user._id,
            req.user.name,
            lockType
        );
        res.json(lockResult);
    } catch (error) {
        console.error('Error acquiring lock:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error acquiring lock' 
        });
    }
};

exports.releaseLock = async (req, res) => {
    try {
        const { id, lockType } = req.params;
        
        if (!['EDIT', 'ARCHIVE'].includes(lockType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid lock type'
            });
        }

        await resourceLockService.releaseLock(id, req.user._id, lockType);
        
        res.json({ 
            success: true,
            message: `${lockType.toLowerCase()} lock released successfully`
        });
    } catch (error) {
        console.error('Error releasing lock:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error releasing lock' 
        });
    }
};

exports.getStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Student.findById(id);
        
        if (!student) {
            return res.status(404).json({ 
                success: false, 
                message: 'Student not found' 
            });
        }

        res.json(student);
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching student', 
            error: error.message 
        });
    }
}; 