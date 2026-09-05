export default class PlayerController {
  constructor(scene, paddle, keyCodes) {
    this.paddle = paddle;
    this.keyUp = scene.input.keyboard.addKey(keyCodes.up);
    this.keyDown = scene.input.keyboard.addKey(keyCodes.down);
  }

  update() {
    let up = this.keyUp.isDown;
    let down = this.keyDown.isDown;

    if (this.paddle.invertControls) {
      [up, down] = [down, up];
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
