const io = require('socket.io-client');

const socket = io('http://localhost:3001'); // Updated to connect to port 3001

socket.on('connect', () => {
    console.log('Connected to WebSocket server');

    // Register a user with a sample ID
    const userId = 4; // Change this to match the expected user ID in the alert creation logic
    socket.emit('register', userId);
});

socket.on('alert', (alert) => {
    console.log('Received alert:', alert);
});

socket.on('disconnect', () => {
    console.log('Disconnected from WebSocket server');
});

// Error handling
socket.on('connect_error', (error) => {
    console.error('Connection Error:', error);
});

socket.on('error', (error) => {
    console.error('Socket Error:', error);
});
