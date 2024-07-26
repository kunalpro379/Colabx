const Room = require("../models/room.models");
const User=require("../models/user.model");
// Function to join a room
exports.joinRoom = async (req, res) => {
    try {
        const { room_name, room_password } = req.body;
        
        // Find the room in the database
        const room = await Room.findOne({
            room_name: room_name,
            room_password: room_password
        });

        if (!room) {
            return res.status(400).json({ msg: "Invalid room credentials" });
        }

        // Add user to the room if not already included
        if (!room.users.includes(req.user.id)) {
            room.users.push(req.user.id);
        }

        await room.save();

        // Return the room ID in the response
        res.json({ msg: "Room joined successfully", roomId: room._id });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Function to create a new room
exports.createRoom = async (req, res) => {
    try {
        const { room_name, description, room_password } = req.body;
        const newRoom = new Room({
            room_name,
            room_password,
            description,
            admin_user_id: req.user.id,
            users: [req.user.id] // Add the current user to the users array
        });

        await newRoom.save();

        res.json({ msg: 'Room created successfully', room: newRoom });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Function to get room data
exports.getRoomData = async (req, res) => {
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
};

// Function to send a message
exports.sendMessage = async (req, res) => {
    const { roomId, content } = req.body;
    const userId = req.user.id; // Get the authenticated user's ID

    try {
        // Find the room by ID
        const room = await Room.findById(roomId);

        if (!room) {
            return res.status(404).json({ msg: 'Room not found' });
        }

        // Check if the user is part of the room
        if (!room.users.includes(userId)) {
            return res.status(403).json({ msg: 'Access denied' });
        }

        // Add the message to the room
        room.messages.push({ sender: userId, content });
        await room.save();

        res.status(201).json({ msg: 'Message sent successfully' });
    } catch (error) {
        console.error(`Error sending message: ${error.message}`);
        res.status(500).send('Server Error');
    }
};

// Function to get all messages in a room
exports.getMessages = async (req, res) => {
    const { roomId } = req.params;
    const userId = req.user.id; // Get the authenticated user's ID

    try {
        // Find the room by ID
        const room = await Room.findById(roomId).populate('messages.sender', 'name');

        if (!room) {
            return res.status(404).json({ msg: 'Room not found' });
        }

        // Check if the user is part of the room
        if (!room.users.includes(userId)) {
            return res.status(403).json({ msg: 'Access denied' });
        }

        // Return the messages
        res.json(room.messages);
    } catch (error) {
        console.error(`Error fetching messages: ${error.message}`);
        res.status(500).send('Server Error');
    }
};