import { touchControls } from "../ui/TouchControls.js";

// Pala de un jugador humano: se mueve con sus teclas o con sus botones táctiles.
export default class PlayerController {
  // side: "p1" o "p2", para saber qué botones táctiles son suyos.
  constructor(scene, paddle, keyCodes, side) {
    this.paddle = paddle;
    this.side = side;
    this.keyUp = scene.input.keyboard.addKey(keyCodes.up);
    this.keyDown = scene.input.keyboard.addKey(keyCodes.down);
  }

  update(delta) {
    let up = this.keyUp.isDown || touchControls.isDown(this.side, "up");
    let down = this.keyDown.isDown || touchControls.isDown(this.side, "down");

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
