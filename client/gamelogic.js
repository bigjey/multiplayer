function movePlayer(player, d) {
  var x = player.x += d.x;
  var y = player.y += d.y;

  if (x < 0) x = 400 + x;
  if (x >= 400) x = x - 400;

  if (y < 0) y = 400 + y;
  if (y >= 400) y = y - 400;

  console.log('gamelogic???');

  return {
    ...player,
    x,
    y
  }
}

if (typeof module === 'object') {
  module.exports = {
    movePlayer: movePlayer
  };
}