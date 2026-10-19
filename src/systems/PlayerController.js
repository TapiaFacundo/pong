import { touchControls } from "../ui/TouchControls.js";

// Pala de un jugador humano: se mueve con sus teclas o con sus botones táctiles.
export default class PlayerController {
  // keyCodes: { up, down }, cada una una tecla o una lista de teclas (en el
  // Arcade, W / S y también las flechas). side: "p1" o "p2", para saber qué
  // botones táctiles son suyos.
  constructor(scene, paddle, keyCodes, side) {
    this.paddle = paddle;
    this.side = side;
    const addKeys = (codes) => [codes].flat().map((code) => scene.input.keyboard.addKey(code));
    this.keysUp = addKeys(keyCodes.up);
    this.keysDown = addKeys(keyCodes.down);
  }

  update(delta) {
    let up = this.keysUp.some((key) => key.isDown) || touchControls.isDown(this.side, "up");
    let down = this.keysDown.some((key) => key.isDown) || touchControls.isDown(this.side, "down");

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
