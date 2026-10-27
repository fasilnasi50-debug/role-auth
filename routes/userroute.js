const express = require('express');
const verifyToken = require('../middleware/authmiddleware');
const {
    getMyProfile,
    updateMyProfile
} = require('../controllers/usercontrollers');

const router = express.Router();

router.get('/profile', verifyToken, getMyProfile);
router.put('/profile', verifyToken, updateMyProfile);

module.exports = router;