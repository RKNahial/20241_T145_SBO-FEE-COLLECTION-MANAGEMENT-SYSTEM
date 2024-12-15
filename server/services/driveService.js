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

  async getDriveStats() {
    try {
      // Get all files (excluding folders)
      const response = await drive.files.list({
        q: "mimeType != 'application/vnd.google-apps.folder'",
        fields: 'files(size)',
        pageSize: 1000
      });

      const files = response.data.files;
      const totalFiles = files.length;
      const totalStorage = files.reduce((acc, file) => acc + (parseInt(file.size) || 0), 0);

      return {
        totalFiles,
        totalStorage: Math.round(totalStorage / 1024 / 1024) // Convert to MB
      };
    } catch (error) {
      console.error('Error getting drive stats:', error);
      throw error;
    }
  }

  async listFiles() {
    try {
      const response = await drive.files.list({
        fields: 'files(id, name, mimeType, size, modifiedTime, webViewLink, webContentLink)',
        pageSize: 100,
        orderBy: 'modifiedTime desc'
      });
      
      return response.data.files;
    } catch (error) {
      console.error('Error listing files:', error);
      throw error;
    }
  }

  async deleteFile(fileId) {
    try {
      await drive.files.delete({
        fileId: fileId
      });
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }
}

module.exports = new DriveService(); 