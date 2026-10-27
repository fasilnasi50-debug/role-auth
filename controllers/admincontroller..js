const db = require('../config/db');

const getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query(
            `SELECT id, username, full_name, email, role, created_at
             FROM users
             ORDER BY id`
        );

        return res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        console.error('Get users error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve users'
        });
    }
};

const getUserById = async (req, res) => {
    const userId = Number(req.params.id);

    if (!Number.isSafeInteger(userId) || userId < 1) {
        return res.status(400).json({
            success: false,
            message: 'A valid user ID is required'
        });
    }

    try {
        const [users] = await db.query(
            `SELECT id, username, full_name, email, role, created_at
             FROM users
             WHERE id = ?`,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            user: users[0]
        });
    } catch (error) {
        console.error('Get user error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve user'
        });
    }
};

const updateUserRole = async (req, res) => {
    const userId = Number(req.params.id);
    const { role } = req.body;

    if (!Number.isSafeInteger(userId) || userId < 1) {
        return res.status(400).json({
            success: false,
            message: 'A valid user ID is required'
        });
    }

    if (!['admin', 'user'].includes(role)) {
        return res.status(400).json({
            success: false,
            message: 'Role must be either admin or user'
        });
    }

    if (Number(req.user.id) === userId) {
        return res.status(400).json({
            success: false,
            message: 'You cannot change your own role'
        });
    }

    try {
        const [result] = await db.query(
            'UPDATE users SET role = ? WHERE id = ?',
            [role, userId]
        );

        if (result.affectedRows === 0) {
            const [users] = await db.query(
                'SELECT id FROM users WHERE id = ?',
                [userId]
            );

            if (users.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: 'User role updated successfully',
            user: {
                id: userId,
                role
            }
        });
    } catch (error) {
        console.error('Update user role error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Failed to update user role'
        });
    }
};

const deleteUser = async (req, res) => {
    const userId = Number(req.params.id);

    if (!Number.isSafeInteger(userId) || userId < 1) {
        return res.status(400).json({
            success: false,
            message: 'A valid user ID is required'
        });
    }

    if (Number(req.user.id) === userId) {
        return res.status(400).json({
            success: false,
            message: 'You cannot delete your own account'
        });
    }

    try {
        const [result] = await db.query(
            'DELETE FROM users WHERE id = ?',
            [userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Failed to delete user'
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUserRole,
    deleteUser
};