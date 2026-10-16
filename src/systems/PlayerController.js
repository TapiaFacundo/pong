export default class PlayerController {
  constructor(scene, paddle, keyCodes) {
    this.paddle = paddle;
    this.keyUp = scene.input.keyboard.addKey(keyCodes.up);
    this.keyDown = scene.input.keyboard.addKey(keyCodes.down);
  }

  update(delta) {
    let up = this.keyUp.isDown;
    let down = this.keyDown.isDown;

    if (this.paddle.invertControls) {
      [up, down] = [down, up];
    }

    // Con el cañón cargado, las teclas mueven la flecha en vez de la pala.
    if (this.paddle.aim) {
      this.paddle.stop();
      this.paddle.aim.steer(up ? -1 : down ? 1 : 0, delta);
      return;
    }

    if (up) {
      this.paddle.moveUp();
    } else if (down) {
      this.paddle.moveDown();
    } else {
      this.paddle.stop();
    }
  }
}
