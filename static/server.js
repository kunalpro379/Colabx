
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const authRouter = require('./routes/auth'); // Ensure correct path
const uiRouter = require('./routes/ui'); // Ensure correct path

const PORT = process.env.PORT || 3000;
const app = express();
// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Static files setup
app.use('/static', express.static(path.join(__dirname, 'static')));

// View engine setup (assuming you're using EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes setup
app.use('/', uiRouter); // Assuming uiRouter handles your UI routes
app.use('/api', authRouter); // Assuming authRouter handles your API routes

// MongoDB connection setup
const DB="mongodb+srv://kunaldp379:kunalpro@cluster0.z7pcgh1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(DB, {

}).then(() => {
    console.log('MongoDB Connected');
}).catch(err => {
    console.error('Error connecting to MongoDB:', err.message);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
