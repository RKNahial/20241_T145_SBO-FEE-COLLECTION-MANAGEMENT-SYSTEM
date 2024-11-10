const express = require('express');
const app = express();

// Add this with your other route imports
const dailyDuesRoutes = require('./routes/dailyDuesRoutes');

// Add this with your other app.use statements
app.use('/api', dailyDuesRoutes);

// Your existing code here

app.listen(8000, () => {
    console.log('Server is running on port 8000');
}); 