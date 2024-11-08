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
const userRoutes = require('./routes/userRoutes');
const loginRoutes = require('./routes/loginRoutes');
const googleroutes = require('./routes/Googleroutes');
const studentRoutes = require('./routes/Addstudent');
const GetAllstudentsRoutes = require('./routes/GetAllStudent');
// Importing database connection
const connectDB = require('./config/DbConnections');

// Use middlewares
app.use(corsMiddleware);
app.use(jsonMiddleware);

// Connect to MongoDB
connectDB();


// Correct route prefixes


app.use("/officers", officerRoutes);
app.use('/api/users', userRoutes);  // User routes (e.g., registration)
app.use('/api/login', loginRoutes); // Login route, can be separated if needed
app.use('/api/auth', googleroutes);
app.use('/api/add/students', studentRoutes);
app.use('/api/getAll/students', GetAllstudentsRoutes);




const port = 8000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
