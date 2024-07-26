class SocketManager {
    constructor() {
        this.roomToSocketIds = {}; // Map roomId to a set of socket IDs
        this.socketToUser = {}; // Map socket ID to userId
    }

    associateUserWithSocket(userId, socketId, roomId) {
        if (!this.roomToSocketIds[roomId]) {
            this.roomToSocketIds[roomId] = new Set();
        }
        this.roomToSocketIds[roomId].add(socketId);
        this.socketToUser[socketId] = userId;
        console.log(`User ${userId} associated with Socket ID ${socketId} and Room ID ${roomId}`);
    }

    dissociateUserFromSocket(socketId) {
        const userId = this.socketToUser[socketId];
        if (userId) {
            // Remove socketId from the room
            for (let roomId in this.roomToSocketIds) {
                this.roomToSocketIds[roomId].delete(socketId);
                if (this.roomToSocketIds[roomId].size === 0) {
                    delete this.roomToSocketIds[roomId];
                }
            }
            delete this.socketToUser[socketId];
            console.log(`User ${userId} is no longer associated with Socket ID ${socketId}`);
        }
    }

    getRoomIdsBySocketId(socketId) {
        const rooms = [];
        for (let roomId in this.roomToSocketIds) {
            if (this.roomToSocketIds[roomId].has(socketId)) {
                rooms.push(roomId);
            }
        }
        return rooms;
    }

    printUserAssociatedWithSocketId(socketId) {
        const userId = this.socketToUser[socketId];
        if (userId) {
            console.log(`Socket ID ${socketId} is associated with User ID ${userId}`);
        } else {
            console.log(`No user associated with Socket ID ${socketId}`);
        }
    }
}

module.exports = SocketManager;
