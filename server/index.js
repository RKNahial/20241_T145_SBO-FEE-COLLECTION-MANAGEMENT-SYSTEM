const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const cors = require('cors');
const app = express();


const corsMiddleware = require('../server/middleware/corsMiddleware');
const jsonMiddleware = require('../server/middleware/josnMiddlware');
// Importing route files
const officerRoutes = require("./routes/offcerArchroutes"); // Import the officer routes
const adminLoginRoutes = require('./routes/adminLogin');
const officerLoginRoutes = require('./routes/officerLogin');
const registerAdminRoutes = require('./routes/registerAdmin');
const registerOfficerRoutes = require('./routes/registerOfficer');

app.use(corsMiddleware);
app.use(jsonMiddleware);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, {
  
})
.then(() => {
    console.log('Database Connected');
})
.catch(err => {
    console.error('Database connection error:', err);
});



// Correct route prefixes
app.use('/admin/login', adminLoginRoutes);
app.use('/officer/login', officerLoginRoutes);
app.use('/admin/register', registerAdminRoutes);
app.use('/officer/register', registerOfficerRoutes);
app.use("/officers", officerRoutes);

const port = 8000;
app.listen(port, () => console.log(`Server is running on port ${port}`));

