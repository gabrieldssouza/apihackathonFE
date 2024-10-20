const { Server } = require('socket.io');
const { setSharedVariable, removeSharedVariable } = require('../bin/config');

let connectedUsers = {};
let io; // Declare io as a global variable

function setIoInstance(socketIo) {
    io = socketIo; // Set the io instance
}

function emitToUser(userId, eventName, data) {
    const socketId = connectedUsers[userId];
    if (socketId) {
        io.to(socketId).emit(eventName, data);
        console.log(`Event "${eventName}" sent to user: ${userId}`);
    } else {
        console.log(`User ${userId} not connected.`);
    }
}

function setupSocketEvents(socketIo) {
    io = socketIo; // Set the io instance
    io.on('connection', (socket) => {
        console.log('A user connected');

        socket.on('register', (userId) => {
            connectedUsers[userId] = socket.id;
            setSharedVariable({ user_id: userId, io_id: socket.id });
            console.log(`User registered: ${userId} with socket ID: ${socket.id}`);
        });

        socket.on('disconnect', () => {
            console.log('A user disconnected');
            handleUserDisconnection(socket.id);
        });
    });
}

function handleUserDisconnection(socketId) {
    for (const userId in connectedUsers) {
        if (connectedUsers[userId] === socketId) {
            delete connectedUsers[userId];
            removeSharedVariable(userId);
            console.log(`User unregistered: ${userId}`);
            break;
        }
    }
}

module.exports = { emitToUser, setupSocketEvents, setIoInstance };
