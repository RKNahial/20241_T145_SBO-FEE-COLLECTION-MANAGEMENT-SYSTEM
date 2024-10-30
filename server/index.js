const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const cors = require('cors');
const app = express();

// Importing route files
const adminLoginRoutes = require('./routes/adminLogin');
const officerLoginRoutes = require('./routes/officerLogin');
const registerAdminRoutes = require('./routes/registerAdmin');
const registerOfficerRoutes = require('./routes/registerOfficer');

app.use(cors()); // Enable CORS for all routes

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Database Connected');
})
.catch(err => {
    console.error('Database connection error:', err);
});

app.use(express.json()); // Parse JSON bodies

// Correct route prefixes
app.use('/admin/login', adminLoginRoutes);
app.use('/officer/login', officerLoginRoutes);
app.use('/admin/register', registerAdminRoutes);
app.use('/officer/register', registerOfficerRoutes);

const port = 8000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
