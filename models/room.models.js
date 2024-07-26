const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
    room_name: { type: String, required: true },
    description: { type: String },
    room_password: { type: String, required: true }, 
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    admin_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    drawingUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    codingUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    activeUsers: [{ type: String }],
    messages: [
        {
            sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            content: { type: String, required: true },
            timestamp: { type: Date, default: Date.now }
        }
    ]
});

const Room = mongoose.model('Room', roomSchema);
module.exports = Room;
