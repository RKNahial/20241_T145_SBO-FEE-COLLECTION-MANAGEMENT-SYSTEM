const studentArchiveService = require('../services/studentArchiveService');
const HistoryLog = require('../models/HistoryLog');

exports.archiveStudent = async (req, res) => {
    const { id } = req.params;
    
    try {
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

        res.status(200).json({ 
            message: 'Student archived successfully', 
            student 
        });
    } catch (error) {
        console.error('Archive error:', error);
        if (error.message === 'Invalid student ID') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ 
            message: 'Failed to archive student. Please try again later.' 
        });
    }
};

exports.unarchiveStudent = async (req, res) => {
    const { id } = req.params;
    
    try {
        const student = await studentArchiveService.updateArchiveStatus(id, false);

        // Create history log
        await HistoryLog.create({
            userName: req.user.name,
            userEmail: req.user.email,
            userPosition: req.user.position,
            action: 'UNARCHIVE_STUDENT',
            details: `${req.user.name} (${req.user.position}) unarchived student: ${student.name}`,
            metadata: { 
                studentId: student._id,
                performedBy: req.user._id
            }
        });

        res.status(200).json({ 
            message: 'Student unarchived successfully', 
            student 
        });
    } catch (error) {
        console.error('Unarchive error:', error);
        if (error.message === 'Invalid student ID') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ 
            message: 'Failed to unarchive student. Please try again later.' 
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
