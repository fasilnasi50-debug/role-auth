const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        const { username, full_name, email, password } = req.body;

        if (!username || !full_name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must contain at least 8 characters'
            });
        }

        const [existingUsers] = await db.query(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Username or email already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            `INSERT INTO users
            (username, full_name, email, password, role)
            VALUES (?, ?, ?, ?, ?)`,
            [username, full_name, email, hashedPassword, 'user']
        );

        return res.status(201).json({
            success: true,
            message: 'Registration successful',
            user: {
                id: result.insertId,
                username,
                full_name,
                email,
                role: 'user'
            }
        });
    } catch (error) {
        console.error('Registration error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Registration failed due to a server error'
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const [users] = await db.query(
            `SELECT id, username, full_name, email, password, role
             FROM users
             WHERE email = ?`,
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect email or password'
            });
        }

        const user = users[0];

        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect email or password'
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is missing from .env');

            return res.status(500).json({
                success: false,
                message: 'Server authentication configuration error'
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || '1h'
            }
        );

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                full_name: user.full_name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Login failed due to a server error'
        });
    }
};

module.exports = {
    register,
    login
};