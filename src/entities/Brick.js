import { ARCADE_BRICK_WIDTH, ARCADE_BRICK_HEIGHT } from "../config.js";

// Ladrillo del Arcade: un rectángulo con cuerpo estático (lo agrega BrickWall
// a su grupo de físicas) que aguanta `hits` golpes.
export default class Brick {
  constructor(scene, x, y, { hits, color }) {
    this.hits = hits;
    this.color = color;

    this.rect = scene.add.rectangle(x, y, ARCADE_BRICK_WIDTH, ARCADE_BRICK_HEIGHT, color);
    // Para encontrar el ladrillo desde el choque con la pelota.
    this.rect.brick = this;
  }

  get x() {
    return this.rect.x;
  }

  get y() {
    return this.rect.y;
  }

  get isBroken() {
    return this.hits <= 0;
  }

  // Le resta un golpe. Devuelve true si con eso se rompió.
  hit() {
    this.hits -= 1;
    if (this.isBroken) {
      // Se apaga en el momento (puede estar en medio del cálculo de choques);
      // BrickWall lo borra del todo al armar el próximo muro.
      this.rect.body.enable = false;
      this.rect.setVisible(false);
    }
    return this.isBroken;
  }
}
