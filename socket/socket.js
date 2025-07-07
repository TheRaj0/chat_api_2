const { Server } = require( 'socket.io');
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);

const allowedOrigins = process.env.ORIGIN
  ? process.env.ORIGIN.split(',').map(origin => origin.trim())
  : [];

const io = new Server(server, {
    path:'/socket.io',
    cors:{
        origin:allowedOrigins,
        method:["GET", "POST"],
        credentials:true,
    }
});

const userSocketMap = {}; //{userId: socketId}

const getSocketId = userId =>  userSocketMap[userId];

io.on('connection', (socket) => {
    console.log('User connected: ', socket.id);

    const {userId} = socket.handshake.query;
    if(userId != 'undefined') userSocketMap[userId] = socket.id;
    
    io.emit('newOnlineUser', Object.keys(userSocketMap));

    socket.on('disconnect', () => {
        console.log('User disconnected: ', socket.id);
        delete userSocketMap[userId];
        io.emit('newOnlineUser', Object.keys(userSocketMap));
    })
})

module.exports = {io, server, app, getSocketId}
