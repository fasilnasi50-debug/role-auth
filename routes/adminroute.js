const express = require('express');
const verifyToken = require('../middleware/authmiddleware');
const authorizeRoles = require('../middleware/rolemiddleware');
const {
    getAllUsers,
    getUserById,
    updateUserRole,
    deleteUser
} = require('../controllers/admincontroller..js');

const router = express.Router();

router.use(verifyToken, authorizeRoles('admin'));

router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

module.exports = router;