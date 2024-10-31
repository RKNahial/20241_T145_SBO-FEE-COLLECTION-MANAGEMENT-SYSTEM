// server/index.js

const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const app = express();

// Importing middleware
const corsMiddleware = require('./middleware/corsMiddleware');
const jsonMiddleware = require('./middleware/josnMiddlware');

// Importing route files
const officerRoutes = require("./routes/offcerArchroutes"); // Import the officer routes
const adminLoginRoutes = require('./routes/adminLogin');
const officerLoginRoutes = require('./routes/officerLogin');
const registerAdminRoutes = require('./routes/registerAdmin');
const registerOfficerRoutes = require('./routes/registerOfficer');

// Importing database connection
const connectDB = require('./config/DbConnections');

// Use middlewares
app.use(corsMiddleware);
app.use(jsonMiddleware);

// Connect to MongoDB
connectDB();

// Correct route prefixes
app.use('/admin/login', adminLoginRoutes);
app.use('/officer/login', officerLoginRoutes);
app.use('/admin/register', registerAdminRoutes);
app.use('/officer/register', registerOfficerRoutes);
app.use("/officers", officerRoutes);

const port = 8000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
