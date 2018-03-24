// sockets

var socket = io.connect('http://localhost:4411');

socket.on('welcome', function (data) {
  console.log('welcome');
});

socket.on('state', (newState) => {
  state = {...newState};
})


// game

var keyboard = new Keyboard();

var frame = null;
var lastTick = null;
var ctx;
var state = null;
var speed = 200/1000;
var W = 400;
var H = 400;

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

  if (x || y) {
    movePlayer(socket.id, {x, y});
    socket.emit('move', {x, y});
  }
}

function movePlayer(pId, {x, y}) {
  var p = state.players[pId];

  p.x += x;
  p.y += y;
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  if (state) {
    for (pId in state.players) {
      const p = state.players[pId];

      ctx.fillRect(p.x - 10, p.y - 10, 20, 20)
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