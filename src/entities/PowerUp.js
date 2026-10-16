import { POWERUP_RADIUS, POWERUP_COLORS } from "../config.js";
import PowerUpIcon from "../ui/PowerUpIcon.js";

export default class PowerUp {
  constructor(scene, x, y, definition) {
    this.definition = definition;

    // El círculo lleva el cuerpo físico (no se ve); lo que se ve es el ícono.
    this.circle = scene.add.circle(x, y, POWERUP_RADIUS, POWERUP_COLORS[definition.colorCategory]).setVisible(false);
    scene.physics.add.existing(this.circle);
    this.circle.body.setCircle(POWERUP_RADIUS);
    this.circle.body.setImmovable(true);

    this.icon = new PowerUpIcon(scene, x, y, definition.kind, definition.colorCategory);
  }

  get x() {
    return this.circle.x;
  }

  get y() {
    return this.circle.y;
  }

  destroy() {
    this.circle.destroy();
    this.icon.destroy();
  }
}
