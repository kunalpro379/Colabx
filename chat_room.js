// // chatroom.js
// const express = require('express');
// const router = express.Router();
// const User = require('../models/user'); // Replace with correct path to your User model

// // Example route to render chatroom page
// router.get('/', async (req, res) => {
//   try {
//     const userId = req.user; // Assuming you have the user ID available in the request
//     const user = await User.findById(userId).select('name'); // Fetch user data

//     // Render the EJS template with user_name passed as a variable
//     res.render('chatroom', { user_name: user.name });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// module.exports = router;
// // 
let roomname = document.getElementById("room").value;
let password = document.getElementById("password").value;
console.log(roomname);
console.log(password);