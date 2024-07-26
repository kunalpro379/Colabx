const jwt = require('jsonwebtoken');
const { Room } = require('../models/room.models');
const User = require('../models/user.model'); 

const SECRET_KEY = 'aaadwalnushaldohcradaam';

const encodeRoom = async (req, res, next) => {
    try {
        const { room_name } = req.params;
        const room = await Room.getRoomByName(room_name);
        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }
        const payload = {
            roomid: room._id,
            room_name: room.room_name,
        };
        const room_auth_token = jwt.sign(payload, SECRET_KEY);
        console.log('Auth Token:', room_auth_token);
        req.authToken = room_auth_token;
        next();
    } catch (error) {
        console.error('Error encoding room:', error.message);
        return res.status(400).json({ success: false, message: error.message });
    }
};

const decodeRooms = (req, res, next) => {
    if (!req.headers['authorization']) {
        return res.status(400).json({ success: false, message: 'Token not found' });
    }
    const accessToken = req.headers.authorization.split(' ')[1];
    try {
        const decoded = jwt.verify(accessToken, SECRET_KEY);
        req.roomid = decoded.roomid;
        req.room_name = decoded.room_name;
        next();
    } catch (error) {
        console.error('Error decoding room:', error.message);
        return res.status(401).json({ success: false, message: error.message });
    }
};

module.exports = { encodeRoom, decodeRooms };
  
// const roomAuth=async(req,res,next)=>{
//     const token=req.header('x-roomauth-token');
// console.log(token)
//     if(!token){
//         return res.status(401).json({ message: 'Authorization denied. Token not found.' });
//         }
//     try{

//         const decoded=jwt.verify(token, 'aaadwalnushaldohcradaam');
//         const userId=decoded.user.id;
//         console.log(token)

//         const room=await Room.findOne({_id: req.params.roomId});
//         if(!room){
//             return res.status(404).json({ message: 'Room not found.' });

//         }
//         const user = await User.findById(userId);
//         if(!user){
//             return res.status(404).json({ message: 'User not found.' });
//         }
//         if(!room.users.includes(userId)){
//             return res.status(403).json({ message: 'Unauthorized. User has not joined the room.' });

//         }
// req.user=user;
// next();
//     }catch(e){
//         console.error('Authentication error:', err.message);
//         return res.status(500).json({ message: 'Server error' });
//     }
// }
// module.exports = roomAuth;
