const app = require('../src/api');
const http = require('http');
const { Server } = require('socket.io');
const { setSharedVariable, removeSharedVariable } = require('./config');
const { emitToUser, setupSocketEvents, setIoInstance } = require('../src/websocket');

const server = http.createServer(app);
const io = new Server(server);

setIoInstance(io); // Set the io instance for use in emitToUser

server.listen(3001, () => {
    console.log('Servidor online na porta 3001');
});

setupSocketEvents(io);
