// const users = []; // Array to store active users

// // Function to add a new user to a room
// function newUser(userId, roomId) {
//     const user = { userId, roomId };
//     users.push(user); // Push user object to the array
//     return roomId; // Return room ID
// }

// // Function to get the current active user by ID
// function getActiveUser(userId) {
//     return users.find(user => user.userId === userId);
// }

// // Function to remove a user from a room
// function exitRoom(userId) {
//     const index = users.findIndex(user => user.userId === userId);
//     if (index !== -1) {
//         return users.splice(index, 1)[0]; // Remove and return the user object
//     }
//     return null; // Return null if user not found
// }

// // Function to get all users in a specific room
// function getIndividualRoom(roomId) {
//     return users.filter(user => user.roomId === roomId);
// }

// module.exports = {
//     newUser,
//     getActiveUser,
//     exitRoom,
//     getIndividualRoom
// };
const Room = require('./models/room.models.js');
const User = require('./models/user.model.js'); // Assuming User model exists

async function addRoomToUser(socketId, roomId, userId) {
    try {
        const user = await User.findByIdAndUpdate(
            userId,
            { $addToSet: { activeRooms: roomId } },
            { new: true }
        );
        return user;
    } catch (error) {
        console.error('Error adding room to user:', error);
        throw error;
    }
}


async function deleteRoomFromUser(roomId, userId) {
    try {
        const user = await User.findByIdAndUpdate(userId, { $pull: { activeRooms: roomId } }, { new: true });
        return user;
    } catch (error) {
        console.error('Error deleting room from user:', error);
        throw error;
    }
}

async function updateActiveUsersInRoom(roomId, userId, socketId, isActive) {
    try {
        let update = {};
        if (isActive) {
            // Add user and socket to activeUsers and activeSockets
            update = {
                $addToSet: {
                    activeUsers: userId,
                    activeSockets: socketId
                }
            };
        } else {
            // Remove socket from activeSockets
            update = {
                $pull: {
                    activeSockets: socketId
                }
            };
        }

        const room = await Room.findOneAndUpdate(
            { roomId },
            update,
            { new: true }
        );

        return room;
    } catch (error) {
        console.error('Error updating active users in room:', error);
        throw error;
    }
}



async function getActiveRoomId(userId) {
    try {
        const user = await User.findById(userId);
        if (user && user.activeRooms.length > 0) {
            return user.activeRooms[0]; // Assuming handling of single active room
        }
        return null; // No active room found
    } catch (error) {
        console.error('Error fetching active room for user:', error);
        throw error;
    }
}

const removeSocketIdFromRoom = async (roomId, socketId) => {
    try {
        const room = await Room.findById(roomId);
        if (!room) {
            return console.error('Room not found');
        }

        // Remove the socketId
        room.activeUsers = room.activeUsers.filter(user => user.socketId !== socketId);
        await room.save();
        console.log(`Socket ID ${socketId} removed from room ${roomId}`);
    } catch (error) {
        console.error('Error removing socket ID from room:', error);
    }
};
const addSocketIdToRoom = async (roomId, socketId) => {
    try {
        const room = await Room.findById(roomId);
        if (!room) {
            return console.error('Room not found');
        }

        // Add the socketId if it doesn't already exist
        if (!room.activeUsers.some(user => user.socketId === socketId)) {
            room.activeUsers.push({ socketId });
            await room.save();
            console.log(`Socket ID ${socketId} added to room ${roomId}`);
        }
    } catch (error) {
        console.error('Error adding socket ID to room:', error);
    }
};
module.exports = {

    addSocketIdToRoom,
    removeSocketIdFromRoom,
    getActiveRoomId,
    addRoomToUser,
    deleteRoomFromUser,
    updateActiveUsersInRoom


};

