import { POWERUP_RADIUS, POWERUP_COLORS } from "../config.js";

export default class PowerUp {
  constructor(scene, x, y, definition) {
    this.definition = definition;

    this.circle = scene.add.circle(x, y, POWERUP_RADIUS, POWERUP_COLORS[definition.colorCategory]);
    scene.physics.add.existing(this.circle);
    this.circle.body.setCircle(POWERUP_RADIUS);
    this.circle.body.setImmovable(true);
  }

  get x() {
    return this.circle.x;
  }

  get y() {
    return this.circle.y;
  }

  destroy() {
    this.circle.destroy();
  }
}
