const db = require('../config/db');

// GET MY PROFILE
const getMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const [users] = await db.query(
            `SELECT id, username, full_name, email, role, created_at
             FROM users
             WHERE id = ?`,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User profile not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Profile retrieved successfully',
            user: users[0]
        });
    } catch (error) {
        console.error('Get profile error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve profile'
        });
    }
};


// UPDATE MY PROFILE
const updateMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { username, full_name, email } = req.body;

        if (!username || !full_name || !email) {
            return res.status(400).json({
                success: false,
                message: 'Username, full name, and email are required'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address'
            });
        }

        // Check if another account uses this username or email
        const [existingUsers] = await db.query(
            `SELECT id
             FROM users
             WHERE (username = ? OR email = ?)
             AND id != ?`,
            [username, email, userId]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Username or email is already used by another account'
            });
        }

        // Update only the authenticated user's profile
        // Role and password cannot be changed through this endpoint
        const [result] = await db.query(
            `UPDATE users
             SET username = ?, full_name = ?, email = ?
             WHERE id = ?`,
            [username, full_name, email, userId]
        );

        if (result.affectedRows === 0) {
            const [users] = await db.query(
                'SELECT id FROM users WHERE id = ?',
                [userId]
            );

            if (users.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User profile not found'
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: userId,
                username,
                full_name,
                email
            }
        });
    } catch (error) {
        console.error('Update profile error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
};

module.exports = {
    getMyProfile,
    updateMyProfile
};