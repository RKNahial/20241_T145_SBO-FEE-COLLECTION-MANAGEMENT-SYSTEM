const cors = require('cors');

const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3026'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Cache-Control',
        'Pragma'
    ]
};

module.exports = cors(corsOptions);
