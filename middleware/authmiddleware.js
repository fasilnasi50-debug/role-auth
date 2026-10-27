
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Please provide a valid token.'
            });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Token is missing.'
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token.'
        });
    }
};

module.exports = verifyToken;
