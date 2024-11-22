const driveService = require('../services/driveService');

exports.uploadFile = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.files.file;
    const result = await driveService.uploadFile(file);

    res.json({
      success: true,
      fileId: result.id,
      webViewLink: result.webViewLink,
      webContentLink: result.webContentLink
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
};

exports.getDriveStats = async (req, res) => {
  try {
    const stats = await driveService.getDriveStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting drive stats:', error);
    res.status(500).json({ error: 'Failed to get drive statistics' });
  }
};

exports.listFiles = async (req, res) => {
  try {
    const files = await driveService.listFiles();
    res.json({ files });
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    await driveService.deleteFile(fileId);
    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
}; 