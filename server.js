
require('dotenv').config();

const express = require('express');
const db = require('./config/db');
const authRoutes = require('./routes/authroutes');
const userRoutes = require('./routes/userroute');
const adminRoutes = require('./routes/adminroute');
const verifyToken = require('./middleware/authmiddleware');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Role-Based Authentication API is running'
    });
});

app.get('/api/health/db', async (req, res) => {
    try {
        await db.query('SELECT 1');

        res.status(200).json({
            success: true,
            message: 'MySQL connection successful'
        });
    } catch (error) {
        console.error('Database connection error:', error.message);

        res.status(500).json({
            success: false,
            message: 'MySQL connection failed'
        });
    }
});

app.get('/api/protected', verifyToken, (req, res) => {
    res.status(200).json({
        success: true,
        message: 'You have access to the protected route',
        user: req.user
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

app.use((error, req, res, next) => {
    if (
        error instanceof SyntaxError &&
        error.status === 400 &&
        'body' in error
    ) {
        return res.status(400).json({
            success: false,
            message: 'Invalid JSON request body'
        });
    }

    next(error);
});

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
