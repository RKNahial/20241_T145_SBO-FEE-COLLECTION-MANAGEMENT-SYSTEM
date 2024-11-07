// server/index.js

const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const app = express();

// Importing middleware
const corsMiddleware = require('./middleware/corsMiddleware');
const jsonMiddleware = require('./middleware/josnMiddlware');

// Importing route files
const authRoutes = require('./routes/AdminCheckemailRoutes'); // Update with the correct path
const officerRoutes = require("./routes/offcerArchroutes"); // Import the officer routes
const adminLoginRoutes = require('./routes/adminLogin');
const officerLoginRoutes = require('./routes/officerLogin');
const registerAdminRoutes = require('./routes/registerAdmin');
const registerOfficerRoutes = require('./routes/registerOfficer');
const treasurerRoutes = require('./routes/TreasurerRoutes');
const treasurerGoogle = require('./routes/TreasurerGoogle'); // Add the officer routes
const GoogleOfficerCheck = require('./routes/OfficerCheckgoogleAccountRoutes');
const userRoutes = require('./routes/userRoutes');
const loginRoutes = require('./routes/loginRoutes');

// Importing database connection
const connectDB = require('./config/DbConnections');

// Use middlewares
app.use(corsMiddleware);
app.use(jsonMiddleware);

// Connect to MongoDB
connectDB();


// Correct route prefixes

app.use('/admin/login', adminLoginRoutes);
app.use('/officer/google', GoogleOfficerCheck);
app.use('/officer/login', officerLoginRoutes);
app.use('/admin/register', registerAdminRoutes);
app.use('/officer/register', registerOfficerRoutes);
app.use("/officers", officerRoutes);
app.use('/api/auth', authRoutes);
app.use('/treasurer', treasurerRoutes);
app.use('/treasurer/google', treasurerGoogle);
app.use('/api/users', userRoutes);  // User routes (e.g., registration)
app.use('/api/login', loginRoutes); // Login route, can be separated if needed



const port = 8000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
