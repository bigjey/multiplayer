function applyCommand(player, command) {
  if (command.type === 'move') {
    // console.log('applying command', {...command})
    return movePlayer(player, command.data);
  }

  console.log('could not apply command', command);
}

function movePlayer(player, d) {
  var x = player.x += d.x;
  var y = player.y += d.y;

  if (x < 0) x = 400 + x;
  if (x >= 400) x = x - 400;

  if (y < 0) y = 400 + y;
  if (y >= 400) y = y - 400;

  return {
    ...player,
    x,
    y
  }
}

if (typeof module === 'object') {
  module.exports = {
    applyCommand: applyCommand
  };
}