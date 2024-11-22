const { drive } = require('../config/driveConfig');
const stream = require('stream');

class DriveService {
  async uploadFile(fileObject, metadata = {}) {
    try {
      const bufferStream = new stream.PassThrough();
      bufferStream.end(fileObject.data);

      const fileMetadata = {
        name: fileObject.name,
        ...metadata
      };

      const media = {
        mimeType: fileObject.mimetype,
        body: bufferStream
      };

      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, webViewLink, webContentLink'
      });

      await this.makeFilePublic(response.data.id);
      return response.data;
    } catch (error) {
      console.error('Drive upload error:', error);
      throw error;
    }
  }

  async makeFilePublic(fileId) {
    try {
      await drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone'
        }
      });
    } catch (error) {
      console.error('Error making file public:', error);
      throw error;
    }
  }

  async createFolder(folderName) {
    try {
      const response = await drive.files.create({
        requestBody: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder'
        },
        fields: 'id'
      });
      
      await this.makeFilePublic(response.data.id);
      return response.data.id;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  }
}

module.exports = new DriveService(); 