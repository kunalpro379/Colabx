const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    username: String,
    message: String,
    timestamp: { type: Date, default: Date.now },
    group: { type: String, default: null },
    recipient: { type: String, default: null }
});

module.exports = mongoose.model('Message', MessageSchema);
