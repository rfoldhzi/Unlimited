// src/app.ts

// import express from 'express';
// import Redis from 'ioredis';
// import http from 'http';
// import { WebSocketServer } from 'ws'; // Note the name change to WebSocketServer

// const app = express();
// const server = http.createServer(app); // Create an HTTP server from your Express app
// const wss = new WebSocketServer({ server: server });
// const port = process.env.PORT || 9000;

// // Create a Redis client
// const redis = new Redis();

// // app.use(express.json());

// app.get('/', (req, res) => {
//   res.send('Hello Redis with Express.js and TypeScript!');
// });

// wss.on('connection', ws => {
//     console.log('Client connected');

//     ws.on('message', message => {
//         console.log(`Received: ${message}`);
//         // Echo message back to the client
//         ws.send(`Server received: ${message}`);
//     });

//     ws.on('close', () => {
//         console.log('Client disconnected');
//     });

//     ws.on('error', error => {
//         console.error('WebSocket error:', error);
//     });
// });

// // Middleware to check if data is in the cache
// const checkCache = async (req, res, next) => {
//   const cachedData = await redis.get('cachedData');

//   if (cachedData) {
//     res.send(JSON.parse(cachedData));
//   } else {
//     next(); // Continue to the route handler if data is not in the cache
//   }
// };

// // Use the checkCache middleware before the route handler
// // app.get('/cache', checkCache, async (req, res) => {
// //   const dataToCache = { message: 'Data to be cached' };
// //   await redis.set('cachedData', JSON.stringify(dataToCache), 'EX', 3600); // Cache for 1 hour
// //   res.send(dataToCache);
// // });

// // // Example route with query parameters
// // app.get('/api', (req, res) => {
// //   const { name } = req.query;
// //   res.send(`Hello, ${name || 'Guest'}!`);
// // });

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

const express = require('express')
const app = express()
const server = require('http').createServer(app);

const WebSocket = require('ws');
const wss = new WebSocket.Server({ server: server });

wss.on('connection', ws => {
    console.log('Client connected');

    ws.on('message', message => {
        console.log(`Received: ${message}`);
        // Echo message back to the client
        ws.send(`Server received: ${message}`);
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });

    ws.on('error', error => {
        console.error('WebSocket error:', error);
    });
});

app.get('/', (req, res) => res.send('Hello World!'))

server.listen(9000, () => console.log(`Lisening on port :9000`))