// server/dbConnection.js

const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Database Connected');
    } catch (err) {
        console.error('Database connection error:', err);
        process.exit(1); // Exit the process with failure
    }
};

module.exports = connectDB;
