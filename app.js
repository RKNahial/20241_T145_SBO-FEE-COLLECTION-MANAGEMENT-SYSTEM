const bodyParser = require('body-parser');
const express = require('express');
const ADMIN_ROUTES = require('./COT-SBO ADMIN ROUTES');     // Admin routes
const OFFICER_ROUTES = require('./COT-SBO OFFICER ROUTES'); // Officer routes
const TREASURER_ROUTES = require('./COT-SBO TREASURER ROUTES'); // Treasurer routes
const STUDENT_ROUTES = require('./COT-SBO STUDENT ROUTES'); // Student routes (hypothetical)

const app = express();

// Home route
app.get('/', (req, res) => {
  res.send('SBO Fee Collection System');
});

// Middleware for parsing request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
f
// Mount the route files
app.use('/admin', ADMIN_ROUTES);         // Admin routes, prefixed with /admin
app.use('/officer', OFFICER_ROUTES);     // Officer routes, prefixed with /officer
app.use('/treasurer', TREASURER_ROUTES); // Treasurer routes, prefixed with /treasurer
app.use('/student', STUDENT_ROUTES);     // Student routes, prefixed with /student

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
})