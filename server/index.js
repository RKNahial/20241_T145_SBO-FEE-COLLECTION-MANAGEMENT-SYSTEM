// server/index.js

const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const app = express();

// Importing middleware
const corsMiddleware = require('./middleware/corsMiddleware');
const jsonMiddleware = require('./middleware/josnMiddlware');

// Importing route files
const userRoutes = require('./routes/userRoutes');
const loginRoutes = require('./routes/loginRoutes');
const googleroutes = require('./routes/Googleroutes');
const studentRoutes = require('./routes/Addstudent');
const GetAllstudentsRoutes = require('./routes/GetAllStudent');
const ArchiveStud = require('./routes/StudentArchive'); // Import student routes
const fileUpload = require('express-fileupload');
const UpdateStudentRoutes = require('./routes/UpdateStudent');
const duesPaymentRoutes = require('./routes/duesPaymentRoutes');
const dailyDuesRoutes = require('./routes/dailyDuesRoutes');
// Import the payment category routes
const paymentCategoryRoutes = require('./routes/paymentCategoryRoutes');
const paymentFeeRoutes = require('./routes/paymentFeeRoutes');


// Importing database connection
const connectDB = require('./config/DbConnections');

// Use middlewares
app.use(corsMiddleware);
app.use(jsonMiddleware);
app.use(fileUpload());

// Connect to MongoDB
connectDB();


// Correct route prefixes

app.use('/api/users', userRoutes);  // User routes (e.g., registration)
app.use('/api/login', loginRoutes); // Login route, can be separated if needed
app.use('/api/auth', googleroutes);
app.use('/api/add/students', studentRoutes);
app.use('/api/getAll/students', GetAllstudentsRoutes);
app.use('/api', ArchiveStud); // Mount the student routes under /api
app.use('/api', UpdateStudentRoutes);
app.use('/api', duesPaymentRoutes);
app.use('/api', paymentCategoryRoutes);
app.use('/api', dailyDuesRoutes);
app.use('/api', paymentFeeRoutes);



const port = 8000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
