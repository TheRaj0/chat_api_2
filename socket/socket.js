const { Server } = require('socket.io');
const express = require('express');
const http = require('http');
const { sendDiscordMessage } = require("../utils/discordNotifier.js");

const app = express();
const server = http.createServer(app);

const allowedOrigins = process.env.ORIGIN
  ? process.env.ORIGIN.split(',').map(origin => origin.trim())
  : [];

const io = new Server(server, {
    path: '/socket.io',
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true,
    }
});

const userSocketMap = {}; //{userId: socketId}

const getSocketId = userId => userSocketMap[userId];

io.on('connection', (socket) => {
    const { userId } = socket.handshake.query;

    if (!userId || userId === 'undefined') {
        console.log('Connection rejected: Invalid or missing userId');
        return;
    }

    console.log('User connected: ', userId);

    const unixTimestamp = Math.floor(Date.now() / 1000);
    sendDiscordMessage(`User \`${userId}\` connected to website at <t:${unixTimestamp}:f>. Visit https://theraj0.github.io/messages`);

    userSocketMap[userId] = socket.id;

    io.emit('newOnlineUser', Object.keys(userSocketMap));

    socket.on('disconnect', () => {
        console.log('User disconnected: ', userId);

        // Prevent race condition on page refresh
        if (userSocketMap[userId] === socket.id) {
            delete userSocketMap[userId];
            io.emit('newOnlineUser', Object.keys(userSocketMap));
        } else {
            console.log(`Ignored stale disconnect for user ${userId} (new socket active)`);
        }
    });
});

module.exports = { io, server, app, getSocketId };
