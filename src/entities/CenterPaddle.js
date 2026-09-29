import { PADDLE_WIDTH, CENTER_PADDLE_HEIGHT, CENTER_PADDLE_SPEED, COLORS } from "../config.js";

export default class CenterPaddle {
  constructor(scene) {
    const field = scene.physics.world.bounds;
    this.rect = scene.add.rectangle(field.centerX, field.centerY, PADDLE_WIDTH, CENTER_PADDLE_HEIGHT, COLORS.PADDLE);
    scene.physics.add.existing(this.rect);
    this.rect.body.setCollideWorldBounds(true);
    this.rect.body.setBounce(0, 1);
    this.rect.body.setImmovable(true);
    this.rect.body.setVelocityY(CENTER_PADDLE_SPEED);
  }

  get y() {
    return this.rect.y;
  }

  destroy() {
    this.rect.destroy();
  }
}
