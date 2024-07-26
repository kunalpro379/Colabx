const express = require("express");
const Router = express.Router();
const auth = require("../middlewares/auth");
const { joinRoom, createRoom, getRoomData } = require('../controllers/roomAuthControllers');
