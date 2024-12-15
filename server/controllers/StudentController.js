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
        
        // Update valid lock types to include Archive and make case-insensitive
        const validLockTypes = ['Edit', 'View', 'Delete', 'Archive'];
        if (!validLockTypes.some(type => type.toLowerCase() === lockType.toLowerCase())) {
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
        
        // Validate user authentication
        if (!req.user || !req.user._id || !req.user.name) {
            return res.status(401).json({
                success: false,
                message: 'User authentication required'
            });
        }

        // Validate lock type
        const validLockTypes = ['Edit', 'View', 'Delete', 'Archive'];
        if (!validLockTypes.some(type => type.toLowerCase() === lockType.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid lock type'
            });
        }

        // Validate student exists
        try {
            const student = await Student.findById(id);
            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: 'Student not found'
                });
            }
        } catch (error) {
            if (error.name === 'CastError') {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid student ID format'
                });
            }
            throw error;
        }

        const lockResult = await resourceLockService.acquireLock(
            id,
            req.user._id,
            req.user.name,
            lockType
        );

        if (!lockResult.success) {
            return res.status(409).json(lockResult); // 409 Conflict
        }

        res.json(lockResult);
    } catch (error) {
        console.error('Error in acquireLock controller:', error);
        
        if (error.message.includes('Invalid resource ID') ||
            error.message.includes('Invalid user ID') ||
            error.message.includes('Invalid lock type')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error while acquiring lock'
        });
    }
};

exports.releaseLock = async (req, res) => {
    try {
        const { id } = req.params;
        const { lockType } = req.params;
        const { userId } = req.body;

        console.log('Release Lock Request:', {
            id,
            lockType,
            userId,
            body: req.body
        });

        if (!id || !lockType) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameters: id or lockType'
            });
        }

        // If userId is not in body, try to get it from auth user
        const effectiveUserId = userId || (req.user && req.user._id);
        
        if (!effectiveUserId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        const result = await resourceLockService.releaseLock(id, effectiveUserId, lockType);
        console.log('Release Lock Result:', result);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json({
            success: true,
            message: 'Lock released successfully'
        });
    } catch (error) {
        console.error('Error in releaseLock controller:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while releasing lock',
            error: error.message
        });
    }
};

exports.getStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Received request to fetch student with ID:', id);
        
        // Use findById with lean() for better performance and to ensure plain object
        const student = await Student.findById(id).lean();
        
        console.log('Found student:', student);
        
        if (!student) {
            console.log('Student not found for ID:', id);
            return res.status(404).json({ 
                success: false, 
                message: 'Student not found' 
            });
        }

        // Explicitly map the fields to ensure only desired data is returned
        const studentData = {
            _id: student._id,
            name: student.name,
            studentId: student.studentId,
            institutionalEmail: student.institutionalEmail,
            yearLevel: student.yearLevel,
            program: student.program,
            status: student.status,
            isArchived: student.isArchived,
            paymentstatus: student.paymentstatus
        };

        console.log('Sending student data:', studentData);

        res.json({
            success: true,
            data: studentData
        });
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching student', 
            error: error.message 
        });
    }
}; 

exports.archive = async (req, res) => {
    try {
        const studentId = req.params.id;
        
        // Verify the student exists
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({
                status: "error",
                data: {
                    message: "Student not found"
                }
            });
        }

        // Check if student is already archived
        if (student.isArchived) {
            return res.status(400).json({
                status: "error",
                data: {
                    message: "Student is already archived"
                }
            });
        }

        // Update the student's archived status
        student.isArchived = true;
        await student.save();

        return res.status(200).json({
            status: "success",
            data: {
                message: "Student archived successfully",
                student: {
                    id: student._id,
                    name: student.name,
                    isArchived: student.isArchived
                }
            }
        });
    } catch (error) {
        console.error('Error in archive:', error);
        return res.status(500).json({
            status: "error",
            data: {
                message: "Failed to archive student"
            }
        });
    }
};

exports.unarchive = async (req, res) => {
    try {
        const studentId = req.params.id;
        
        // Verify the student exists
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({
                status: "error",
                data: {
                    message: "Student not found"
                }
            });
        }

        // Check if student is already unarchived
        if (!student.isArchived) {
            return res.status(400).json({
                status: "error",
                data: {
                    message: "Student is not archived"
                }
            });
        }

        // Update the student's archived status
        student.isArchived = false;
        await student.save();

        return res.status(200).json({
            status: "success",
            data: {
                message: "Student unarchived successfully",
                student: {
                    id: student._id,
                    name: student.name,
                    isArchived: student.isArchived
                }
            }
        });
    } catch (error) {
        console.error('Error in unarchive:', error);
        return res.status(500).json({
            status: "error",
            data: {
                message: "Failed to unarchive student"
            }
        });
    }
};

exports.cleanUserLocks = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        const result = await resourceLockService.cleanAllLocksForUser(userId);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error('Error in cleanUserLocks controller:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while cleaning locks',
            error: error.message
        });
    }
};