function Keyboard() {
  this.pressed = {};
  this.KEYS = {
    LEFT: 37,
    RIGHT: 39,
    UP: 38,
    DOWN: 40,
  }

  document.addEventListener('keydown', (e) => {
    this.pressed[e.keyCode] = true;
  })

  document.addEventListener('keyup', (e) => {
    this.pressed[e.keyCode] = false;
  })
}