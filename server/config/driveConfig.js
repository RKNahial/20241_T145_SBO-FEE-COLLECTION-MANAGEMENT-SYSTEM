const { google } = require('googleapis');
const path = require('path');

const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.metadata',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/contacts.readonly'
];

const formatPrivateKey = (key) => {
  return key.replace(/\\n/g, '\n');
};

const auth = new google.auth.GoogleAuth({
  credentials: {
    type: process.env.GOOGLE_DRIVE_TYPE,
    project_id: process.env.GOOGLE_DRIVE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_DRIVE_PRIVATE_KEY_ID,
    private_key: formatPrivateKey(process.env.GOOGLE_DRIVE_PRIVATE_KEY),
    client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_DRIVE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.GOOGLE_DRIVE_CLIENT_EMAIL}`
  },
  scopes: SCOPES
});

const drive = google.drive({ version: 'v3', auth });

module.exports = { drive, auth }; 