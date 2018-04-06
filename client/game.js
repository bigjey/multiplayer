// sockets

var socket = io.connect("http://localhost:4411");

socket.on("state", newState => {
  newState.players &&
    state &&
    state.players &&
    Object.keys(newState.players).forEach(pId => {
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
      };
    });

  state = { ...newState };

  commands = commands.filter(c => {
    return c.id > state.players[socket.id].latestCommand;
  });

  commands.forEach(c => {
    state.players[socket.id] = applyCommand(state.players[socket.id], c);
  });

  draw();
});

// game

var keyboard = new Keyboard();

var frame = null;
var lastTick = null;
var ctx;
var state = null;
var bullets = [];
var PLAYER_SPEED = 200 / 1000;
var W = 400;
var H = 400;
var CLIENT_LATENCY = 500;
var PLAYER_SIZE = 20;
var BULLET_SIZE = 4;
var BULLET_SPEED = 300 / 1000;

var commands = [];
var nextCommandId = 0;

var scope = null;
var SCOPE_SIZE = 5;
var canShoot = function() {
  return state !== null && scope !== null;
};

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
  const movedBy = (PLAYER_SPEED * delta).toFixed(2);
  var x = 0;
  var y = 0;

  if (keyboard.isPressed(keyboard.KEYS.LEFT)) {
    x -= +movedBy;
  }
  if (keyboard.isPressed(keyboard.KEYS.RIGHT)) {
    x += +movedBy;
  }
  if (keyboard.isPressed(keyboard.KEYS.UP)) {
    y -= +movedBy;
  }
  if (keyboard.isPressed(keyboard.KEYS.DOWN)) {
    y += +movedBy;
  }

  state &&
    state.players &&
    Object.keys(state.players).forEach(pId => {
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
    });

  var i = 0;
  while (i < bullets.length) {
    var b = bullets[i];

    if (b.x < 0 || b.y < 0 || b.x > W || b.y > H) {
      bullets.splice(i, 1);
      continue;
    }

    b.x += b.velocity.x * BULLET_SPEED * delta;
    b.y += b.velocity.y * BULLET_SPEED * delta;

    i++;
  }

  if (x || y) {
    let command = {
      id: ++nextCommandId,
      type: "move",
      data: { x, y }
    };

    state.players[socket.id] = applyCommand(state.players[socket.id], command);
    commands.push(command);

    draw();

    setTimeout(function() {
      socket.emit("command", command);
    }, CLIENT_LATENCY);
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  ctx.fillStyle = "#000";

  if (state) {
    for (pId in state.players) {
      const p = state.players[pId];

      const x = (p.from && p.from.x) || p.x;
      const y = (p.from && p.from.y) || p.y;

      ctx.fillRect(
        x - PLAYER_SIZE / 2,
        y - PLAYER_SIZE / 2,
        PLAYER_SIZE,
        PLAYER_SIZE
      );
    }
  }

  bullets.forEach(b => {
    ctx.fillRect(
      b.x - BULLET_SIZE / 2,
      b.y - BULLET_SIZE / 2,
      BULLET_SIZE,
      BULLET_SIZE
    );
  });

  if (scope) {
    ctx.beginPath();
    ctx.arc(scope.x, scope.y, SCOPE_SIZE / 2, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#aaa";

    ctx.beginPath();
    ctx.arc(scope.x, scope.y, SCOPE_SIZE * 2.5, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.stroke();
  }
}

function createCanvas() {
  const canvas = document.createElement("canvas");
  ctx = canvas.getContext("2d");

  canvas.width = W;
  canvas.height = H;

  document.body.appendChild(canvas);

  canvas.addEventListener("mouseenter", function(e) {
    var { x, y } = canvas.getBoundingClientRect();
    scope = new Vector2(e.clientX - x, e.clientY - y);
  });
  canvas.addEventListener("mousemove", function(e) {
    var { x, y } = canvas.getBoundingClientRect();
    scope = new Vector2(e.clientX - x, e.clientY - y);
  });
  canvas.addEventListener("mouseleave", function() {
    scope = null;
  });

  canvas.addEventListener("click", function(e) {
    var { x, y } = canvas.getBoundingClientRect();
    var scope = { x: e.clientX - x, y: e.clientY - y };

    if (canShoot()) {
      let command = {
        id: ++nextCommandId,
        type: "shoot",
        data: scope
      };

      var bullet = applyCommand(state.players[socket.id], command);

      // bullets.push(bullet);
      // commands.push(command);

      draw();

      // setTimeout(function() {
      //   socket.emit("command", command);
      // }, CLIENT_LATENCY);
    }
  });
}
