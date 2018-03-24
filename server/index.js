const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');

const Game = require('./game');

app.use(express.static(path.join(__dirname, '../client')));

new Game(io);

server.listen(4411, () => {
  console.log('running at http://localhost:4411')
});