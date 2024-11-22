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