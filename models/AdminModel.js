const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  last_name: { type: String, required: true },
  first_name: { type: String, required: true },
  middle_name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { collection: 'Admin_Info' }); // Place the options here

// Export the Admin model
const AdminModel = mongoose.model('Admin', AdminSchema);
module.exports = AdminModel;
