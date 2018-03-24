const { movePlayer } = require('../client/gamelogic');

function Game(io) {
  const players = {};
  const SERVER_LATENCY = 500;

  io.on('connection', (socket) => {
    console.log('connect', Object.keys(players).length);

    const p = {
      x: 100 + Object.keys(players).length * 100,
      y: 200
    }
    
    players[socket.id] = p;

    updateState();

    socket.on('move', (d) => {
      players[socket.id] = movePlayer(players[socket.id], d);
      updateState();
    })

    socket.on('disconnect', () => {
      console.log('disconnect', socket.id);
      delete players[socket.id];
    })
  })

  function updateState(){
    const state = {players};

    setTimeout(() => {
      io.emit('state', state);
    }, SERVER_LATENCY);

  }

}


module.exports = Game;