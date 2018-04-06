const { applyCommand } = require('../client/gamelogic');

function Game(io) {
  const players = {};
  const SERVER_LATENCY = 500;

  io.on('connection', (socket) => {
    console.log('connect', Object.keys(players).length);

    const p = {
      x: 100 + Object.keys(players).length * 100,
      y: 200,
      latestCommand: -1
    }
    
    players[socket.id] = p;

    updateState();

    socket.on('command', (command) => {
      players[socket.id] = applyCommand(players[socket.id], command);
      players[socket.id].latestCommand = command.id;
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

  setInterval(updateState, 1000/10);

}


module.exports = Game;