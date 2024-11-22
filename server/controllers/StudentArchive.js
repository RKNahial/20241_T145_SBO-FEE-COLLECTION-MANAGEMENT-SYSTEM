const studentArchiveService = require('../services/studentArchiveService');
const resourceLockService = require('../services/resourceLockService');
const HistoryLog = require('../models/HistoryLog');

exports.archiveStudent = async (req, res) => {
    const { id } = req.params;
    
    try {
        // Try to acquire archive lock
        const lockResult = await resourceLockService.acquireLock(
            id, 
            req.user._id, 
            req.user.name,
            'ARCHIVE'
        );

        if (!lockResult.success) {
            return res.status(423).json({ 
                message: lockResult.message 
            });
        }

        const student = await studentArchiveService.updateArchiveStatus(id, true);

        // Create history log
        await HistoryLog.create({
            userName: req.user.name,
            userEmail: req.user.email,
            userPosition: req.user.position,
            action: 'ARCHIVE_STUDENT',
            details: `${req.user.name} (${req.user.position}) archived student: ${student.name}`,
            metadata: { 
                studentId: student._id,
                performedBy: req.user._id
            }
        });

        // Release the lock after successful operation
        await resourceLockService.releaseLock(id, req.user._id, 'ARCHIVE');

        res.status(200).json({ 
            message: 'Student archived successfully', 
            student 
        });
    } catch (error) {
        // Make sure to release lock even if operation fails
        await resourceLockService.releaseLock(id, req.user._id, 'ARCHIVE');
        
        console.error('Archive error:', error);
        res.status(error.message === 'Invalid student ID' ? 400 : 500).json({ 
            message: error.message || 'Server error'
        });
    }
};

exports.unarchiveStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await studentArchiveService.updateArchiveStatus(id, false);

        await HistoryLog.create({
            userName: req.body.userName,
            userEmail: req.body.userEmail,
            userPosition: req.body.userPosition,
            action: 'UNARCHIVE_STUDENT',
            details: `Unarchived student: ${student.name}`,
            metadata: { studentId: student._id }
        });

        res.status(200).json({ 
            message: 'Student unarchived successfully', 
            student 
        });
    } catch (error) {
        res.status(error.message === 'Invalid student ID' ? 400 : 500).json({ 
            message: error.message || 'Server error', 
            error 
        });
    }
};

exports.importFromExcel = async (req, res) => {
    try {
        if (!req.files || !req.files['excel-file']) {
            return res.status(400).json({ error: 'No Excel file uploaded' });
        }

        const { successCount, errors } = await studentArchiveService.importFromExcel(
            req.files['excel-file'].data
        );

        res.json({
            message: `Successfully imported ${successCount} students${
                errors.length > 0 ? ` with ${errors.length} errors` : ''
            }`,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        console.error('Import error:', error);
        res.status(500).json({ 
            error: 'Error importing students from Excel. Please check your file format.' 
        });
    }
};
