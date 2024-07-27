const express = require("express");
const Router = express.Router();
const auth = require("../middlewares/auth");
const Message = require('../models/chat_models/MsgModel.js');
const Room = require('../models/room.models.js'); // Ensure you have Room model
const User = require('../models/user.model.js'); // Ensure you have User model

const { joinRoom, createRoom, getRoomData, sendMessage, getMessages } = require('../controllers/roomAuthControllers');

// Route for joining a room
Router.post('/join_room', auth, joinRoom);

// Route for creating a room
Router.post('/create_room', auth, createRoom);

Router.get('/:roomId', auth, async (req, res) => {
    try {
        const roomId = req.params.roomId;
        
        // Find the room by ID
        const room = await Room.findById(roomId);

        if (!room) {
            return res.status(404).json({ msg: 'Room not found' });
        }

        // Check if the authenticated user is part of the room's active users
        const user = await User.findById(req.user.id);

        if (!user.activeRooms.includes(roomId)) {
            return res.status(403).json({ msg: 'Access denied' });
        }

        // Return the room data
        res.json(room);
    } catch (error) {
        console.error(`Error fetching room data: ${error.message}`);
        res.status(500).send('Server Error');
    }
});

Router.post('/:roomId/send_message', auth, async (req, res) => {
    const { roomId } = req.params;
    const { userId, message } = req.body;
    console.log(`Room ID: ${roomId}, User ID: ${userId}, Message: ${message}`);
    try {
        const groupMsg = new Message({ username: userId, message: message, group: roomId });
        await groupMsg.save();
        const io = req.app.get('io');
        io.to(roomId).emit('groupMessage', groupMsg);
        res.status(200).send(groupMsg);
    } catch (err) {
        console.error('Error:', err);
        res.status(400).send({ error: err.message });
    }
});

Router.get('/:roomId/messages', auth, async (req, res) => {
    try {
        const { roomId } = req.params;
        // Fetch messages from the database for the given roomId
        const messages = await Message.find({ group: roomId }).sort({ createdAt: 1 });
        res.json({ messages });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching messages' });
    }
});

module.exports = Router;
