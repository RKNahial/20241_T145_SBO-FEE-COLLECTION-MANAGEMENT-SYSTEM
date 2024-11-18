const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    console.log('Auth Middleware - Headers:', req.headers);

    try {
        const authHeader = req.header('Authorization');
        console.log('Auth Header:', authHeader);
        
        if (!authHeader) {
            console.log('No Authorization header found');
            return res.status(401).json({ 
                message: 'No Authorization header found' 
            });
        }

        const token = authHeader.replace('Bearer ', '');
        console.log('Extracted token:', token.substring(0, 20) + '...');
        
        if (!token) {
            console.log('No token found in Authorization header');
            return res.status(401).json({ 
                message: 'No token found in Authorization header' 
            });
        }

        try {
            console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Token decoded successfully:', decoded);
            req.user = decoded;
            next();
        } catch (error) {
            console.log('Token verification failed:', error.message);
            return res.status(401).json({ 
                message: 'Invalid or expired token',
                error: error.message 
            });
        }
    } catch (error) {
        console.log('Auth middleware error:', error.message);
        res.status(401).json({ 
            message: 'Authentication failed',
            error: error.message 
        });
    }
};

module.exports = auth; 