const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const adminRoutes = require('./ROUTES/COT-SBO ADMIN ROUTES.js'); // Ensure the path is correct
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'AdminLogin' directory
app.use(express.static('AdminLogin'));

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', './AdminLogin');

// Sample route to render the login page
app.get('/login', (req, res) => {
  res.render('login'); // Render the login.ejs view
});

// Use admin routes
app.use('/admin', adminRoutes);

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/AdminDB')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 3026;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
