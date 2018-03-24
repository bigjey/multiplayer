function Game(io) {
  const players = {};
  const LATENCY = 500;

  io.on('connection', (socket) => {
    console.log('connect', Object.keys(players).length);

    const p = {
      x: 100 + Object.keys(players).length * 100,
      y: 200
    }
    
    players[socket.id] = p;

    updateState();

    socket.on('move', ({x, y}) => {

      var p = players[socket.id];

      p.x += x;
      p.y += y;

      if (p.x < 0) p.x = 400 + p.x;
      if (p.x >= 400) p.x = p.x - 400;

      if (p.y < 0) p.y = 400 + p.y;
      if (p.y >= 400) p.y = p.y - 400;

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
    }, LATENCY);

  }

}


module.exports = Game;