import {
  ARCADE_BRICK_WIDTH,
  ARCADE_BRICK_HEIGHT,
  ARCADE_TOUGH_BRICK_COLORS,
  ARCADE_METAL_COLOR,
  ARCADE_METAL_BORDER_COLOR,
} from "../config.js";
import { METAL } from "../data/arcade.js";

// Ladrillo del Arcade: un rectángulo con cuerpo estático (lo agrega BrickWall
// a su grupo de físicas). `hits` son los golpes que aguanta (1 a 3), o METAL
// si no se rompe. El color muestra cuántos golpes le quedan: dorado (3),
// plateado (2) o el de su columna (1).
export default class Brick {
  constructor(scene, x, y, { hits, columnColor }) {
    this.isMetal = hits === METAL;
    this.maxHits = this.isMetal ? Infinity : hits;
    this.hits = this.maxHits;
    this.columnColor = columnColor;

    this.rect = scene.add.rectangle(x, y, ARCADE_BRICK_WIDTH, ARCADE_BRICK_HEIGHT);
    if (this.isMetal) this.rect.setStrokeStyle(2, ARCADE_METAL_BORDER_COLOR);
    // Para encontrar el ladrillo desde el choque con la pelota.
    this.rect.brick = this;
    this.refreshColor();
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

  // El color actual (también el de los destellos al golpearlo).
  get color() {
    if (this.isMetal) return ARCADE_METAL_COLOR;
    return ARCADE_TOUGH_BRICK_COLORS[this.hits] ?? this.columnColor;
  }

  refreshColor() {
    this.rect.setFillStyle(this.color);
  }

  // Le resta golpes (al metal no le hace nada). Devuelve true si con eso se rompió.
  hit(amount = 1) {
    if (this.isMetal) return false;

    this.hits -= amount;
    if (this.isBroken) {
      // Se apaga en el momento (puede estar en medio del cálculo de choques);
      // BrickWall lo borra del todo al armar el próximo muro.
      this.rect.body.enable = false;
      this.rect.setVisible(false);
    } else {
      this.refreshColor();
    }
    return this.isBroken;
  }
}
