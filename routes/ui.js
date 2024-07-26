const express = require('express');
const uiRouter = express.Router();

// Example routes
uiRouter.get('/', (req, res) => {
    res.render('index'); // Render your index template (e.g., index.ejs or index.pug)
});

uiRouter.get('/login', (req, res) => {
    res.render('login'); // Render your login template
});

uiRouter.get('/register', (req, res) => {
    res.render('register'); // Render your register template
});

// Route to render the room options page
uiRouter.get('/room_options', (req, res) => {
    res.render('room_options', { user: req.user }); // Pass user data if available
});

// Route to render the create room page
uiRouter.get('/room_options/create', (req, res) => {
    res.render('create_room'); // Render the create room template (e.g., create_room.ejs or create_room.pug)
});

// Dynamic route to render the home page for a specific room
uiRouter.get('/colabx/:roomName', (req, res) => {
    const { roomName } = req.params;
    res.render('home', { roomName });
});

module.exports = uiRouter;
