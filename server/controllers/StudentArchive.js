const studentArchiveService = require('../services/studentArchiveService');

exports.archiveStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await studentArchiveService.updateArchiveStatus(id, true);
        res.status(200).json({ 
            message: 'Student archived successfully', 
            student 
        });
    } catch (error) {
        res.status(error.message === 'Invalid student ID' ? 400 : 500).json({ 
            message: error.message || 'Server error', 
            error 
        });
    }
};

exports.unarchiveStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await studentArchiveService.updateArchiveStatus(id, false);
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
