// sockets

var socket = io.connect('http://localhost:4411');

socket.on('state', (newState) => {
  newState.players && state.players && Object.keys(newState.players).forEach(pId => {
    if (pId === socket.id || !state.players[pId]) return;

    let player = newState.players[pId];
    let oldPlayer = state.players[pId];

    newState.players[pId] = {
      ...player,
      to: {
        x: player.x,
        y: player.y
      },
      from: {
        x: oldPlayer.x,
        y: oldPlayer.y
      }
    }

  })

  state = {...newState};

  commands = commands.filter(c => {
    return c.id > state.players[socket.id].latestCommand
  });

  commands.forEach(c => {
    state.players[socket.id] = applyCommand(state.players[socket.id], c)
  });

  draw();
})


// game

var keyboard = new Keyboard();

var frame = null;
var lastTick = null;
var ctx;
var state = {};
var speed = 200/1000;
var W = 400;
var H = 400;
var CLIENT_LATENCY = 500;

var commands = [];
var nextCommandId = 0;

createCanvas();
tick();


function tick() {
  const now = Date.now();

  if (!lastTick) lastTick = now;

  const delta = now - lastTick;

  frame = requestAnimationFrame(tick);

  if (delta > 0) update(delta);

  draw();

  lastTick = now;
}

function update(delta) {
  const movedBy = (speed * delta).toFixed(2);
  var x = 0;
  var y = 0;

  if (keyboard.pressed[keyboard.KEYS.LEFT]) {
    x -= +movedBy;
  }
  if (keyboard.pressed[keyboard.KEYS.RIGHT]) {
    x += +movedBy;
  }
  if (keyboard.pressed[keyboard.KEYS.UP]) {
    y -= +movedBy;
  }
  if (keyboard.pressed[keyboard.KEYS.DOWN]) {
    y += +movedBy;
  }

  state.players && Object.keys(state.players).forEach(pId => {
    if (pId === socket.id) return;

    let player = state.players[pId];

    if (player.from && player.to) {
      const dx = player.to.x - player.from.x;
      const dy = player.to.y - player.from.y;

      if (Math.abs(dx) > 0) {
        if (movedBy > Math.abs(dx)) {
          player.from.x = player.to.x;
        } else {
          player.from.x += Math.sign(dx) * +movedBy;
        }
      }

      if (Math.abs(dy) > 0) {
        if (movedBy > Math.abs(dy)) {
          player.from.y = player.to.y;
        } else {
          player.from.y += Math.sign(dy) * +movedBy;
        }
      }
    }
  })

  if (x || y) {
    let command = {
      id: ++nextCommandId,
      type: 'move',
      data: {x, y}
    }

    state.players[socket.id] = applyCommand(state.players[socket.id], command);
    commands.push(command);

    draw();

    setTimeout(function() {
      socket.emit('command', command);
    }, CLIENT_LATENCY)
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  if (state) {
    for (pId in state.players) {
      const p = state.players[pId];

      const x = (p.from && p.from.x) || p.x;
      const y = (p.from && p.from.y) || p.y;

      ctx.fillRect(x - 10, y - 10, 20, 20)
    }
  }
}

function createCanvas(){
  const canvas = document.createElement('canvas');
  ctx = canvas.getContext('2d');

  canvas.width = W;
  canvas.height = H;

  document.body.appendChild(canvas);
}