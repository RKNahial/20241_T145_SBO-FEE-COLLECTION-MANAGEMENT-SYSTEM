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
// Import the payment category routes
const paymentCategoryRoutes = require('./routes/paymentCategoryRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const profileRoutes = require('./routes/profileRoutes');

process.removeAllListeners('warning');
// Importing database connection
const connectDB = require('./config/DbConnections');

// Use middlewares
app.use(corsMiddleware);
app.use(jsonMiddleware);
app.use(fileUpload());

// Connect to MongoDB
connectDB();


// Correct route prefixes
app.use('/api/users', userRoutes);
app.use('/api', loginRoutes);
app.use('/api/auth', googleroutes);
app.use('/api', studentRoutes);
app.use('/api/getAll/students', GetAllstudentsRoutes);
app.use('/api', ArchiveStud); // Mount the student routes under /api
app.use('/api', UpdateStudentRoutes);
app.use('/api', duesPaymentRoutes);
app.use('/api', paymentCategoryRoutes);
app.use('/api/payment-fee', paymentRoutes);
app.use('/api/profile', profileRoutes);



const port = 8000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
