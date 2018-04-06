function Keyboard() {
  this.pressed = {};
  this.KEYS = {
    LEFT: [65, 37],
    RIGHT: [68, 39],
    UP: [87, 38],
    DOWN: [83, 40]
  };

  this.isPressed = function(code) {
    if (Array.isArray(code)) {
      return code.some(c => this.pressed[c]);
    } else {
      return this.pressed[c];
    }
  };

  document.addEventListener("keydown", e => {
    this.pressed[e.keyCode] = true;
  });

  document.addEventListener("keyup", e => {
    this.pressed[e.keyCode] = false;
  });
}
