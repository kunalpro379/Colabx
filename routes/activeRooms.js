const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Room = require('../models/room.models');
const User = require('../models/user.model');

// GET /api/active_rooms
// Get active rooms for the authenticated user
router.get('/', auth, async (req, res) => {
    try {
        // Find the user and populate the activeRoom field
        const user = await User.findById(req.user.id).populate('activeRoom');

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Return the active room
        res.json(user.activeRoom);
    } catch (error) {
        console.error(`Error fetching active room: ${error.message}`);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
