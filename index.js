const express = require("express");
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const { Server } = require('socket.io');
const http = require('http');
const path = require('path');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const DB = process.env.DB;

const authRouter = require("./routes/auth");
const uiRouter = require('./routes/ui');
const roomAuthRouter = require('./routes/room_auth');

// Middleware setup
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev'));

// Routes setup
app.use(authRouter);
app.use('/', uiRouter);
app.use('/api/room_auth', roomAuthRouter);

// Serve static files
app.use('/ui_scripts', express.static('ui_scripts'));
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use('/colabx/ui_scripts', express.static('ui_scripts'));

// View engine setup (if using EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// MongoDB connection
mongoose.connect(DB)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));

// Socket.IO logic
const users = {};
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('joinRoom', async ({ userId, roomId }) => {
        try {
            users[userId] = socket.id;
            socket.join(roomId);
            console.log(`User ${socket.id} associated with ${userId}`);
            console.log(`User ${userId} joined room ${roomId}`);
            socket.emit('userConnected', { userId, roomId });
        } catch (error) {
            console.error('Error joining room:', error);
        }
    });

    socket.on('joinCode', ({ roomId }) => {
        console.log(`hey -->User ${socket.id} joined room ${roomId}`);
        socket.join(roomId);
    });

    socket.on('codeChange', (data) => {
        console.log(`Code change in room ${data.roomId}: ${data.code}`);
        io.to(data.roomId).emit('codeChange', data);
    });
    socket.on('sendMessage', ({ roomId, message, userId }) => {
        if (!message || !userId || !roomId) {
            console.error('Invalid message data:', { roomId, message, userId });
            return;
        }
        
        console.log(`Emitting message to room ${roomId}:`, { text: message, senderId: userId });
        io.to(roomId).emit('groupMessage', { message,  userId });
    });

    socket.on('joinRoomCanvas', (roomId) => {
        if (roomId) {
            socket.join(roomId);
            console.log(`Socket ${socket.id} joined room ${roomId}`);
        }
    }); 
       socket.on('draw', (drawData) => {
        // Broadcast drawing data to the room
        if (drawData.roomId) {
            socket.to(drawData.roomId).emit('drawing', drawData);
        }
    });
    socket.on('disconnect', () => {
        try {
            for (const user in users) {
                if (users[user] === socket.id) {
                    delete users[user];
                    break;
                }
            }
            console.log(`User disconnected: ${socket.id}`);
        } catch (error) {
            console.error('Error during disconnect:', error);
        }
    });
});

app.set('io', io);
app.set('users', users);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
