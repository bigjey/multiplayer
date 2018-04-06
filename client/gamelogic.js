class Vector2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  magnitude({ x, y } = new Vector2(0, 0)) {
    return Math.sqrt(Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2));
  }

  normalize() {
    let m = this.magnitude();

    return new Vector2(this.x / m, this.y / m);
  }

  add({ x, y } = new Vector2(0, 0)) {
    return new Vector2(this.x + x, this.y + y);
  }

  subtract({ x, y } = new Vector2(0, 0)) {
    return new Vector2(this.x - x, this.y - y);
  }

  multiply({ x, y } = new Vector2(1, 1)) {
    return new Vector2(this.x * x, this.y * y);
  }

  toJS() {
    return { x: this.x, y: this.y };
  }
}

Vector2.from = function({ x, y }) {
  return new Vector2(x, y);
};

function applyCommand(player, command) {
  if (command.type === "move") {
    // console.log('applying command', {...command})
    return movePlayer(player, command.data);
  }
  if (command.type === "shoot") {
    // console.log('applying command', {...command})
    return spawnBullet(player, command.data);
  }

  console.log("could not apply command", command);
}

function movePlayer(player, d) {
  var x = (player.x += d.x);
  var y = (player.y += d.y);

  if (x < 0) x = 400 + x;
  if (x >= 400) x = x - 400;

  if (y < 0) y = 400 + y;
  if (y >= 400) y = y - 400;

  return {
    ...player,
    x,
    y
  };
}

function spawnBullet(player, scope) {
  var s = Vector2.from(scope);
  var p = Vector2.from(player);

  var velocity = s.subtract(p).normalize();
  var position = p.add(velocity.multiply(new Vector2(22, 22)));

  return {
    owner: player.id,
    velocity: velocity.toJS(),
    ...position.toJS()
  };
}

if (typeof module === "object") {
  module.exports = {
    applyCommand: applyCommand
  };
}
