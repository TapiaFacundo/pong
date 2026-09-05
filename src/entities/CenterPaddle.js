import { PADDLE_WIDTH, CENTER_PADDLE_HEIGHT, CENTER_PADDLE_SPEED, GAME_WIDTH, GAME_HEIGHT, COLORS } from "../config.js";

export default class CenterPaddle {
  constructor(scene) {
    this.rect = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, PADDLE_WIDTH, CENTER_PADDLE_HEIGHT, COLORS.PADDLE);
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
