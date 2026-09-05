import { PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_SPEED, COLORS } from "../config.js";

export default class Paddle {
  constructor(scene, x, y) {
    this.baseSpeed = PADDLE_SPEED;
    this.speed = PADDLE_SPEED;
    this.baseHeight = PADDLE_HEIGHT;
    this.invertControls = false;

    this.rect = scene.add.rectangle(x, y, PADDLE_WIDTH, PADDLE_HEIGHT, COLORS.PADDLE);
    scene.physics.add.existing(this.rect);
    this.rect.body.setCollideWorldBounds(true);
    this.rect.body.setImmovable(true);
  }

  get x() {
    return this.rect.x;
  }

  get y() {
    return this.rect.y;
  }

  moveUp() {
    this.rect.body.setVelocityY(-this.speed);
  }

  moveDown() {
    this.rect.body.setVelocityY(this.speed);
  }

  stop() {
    this.rect.body.setVelocityY(0);
  }

  setBaseSpeed(value) {
    this.baseSpeed = value;
    this.speed = value;
  }

  setSpeedScale(scale) {
    this.speed = this.baseSpeed * scale;
  }

  resetSpeed() {
    this.speed = this.baseSpeed;
  }

  setHeightScale(scale) {
    const height = this.baseHeight * scale;
    this.rect.setSize(PADDLE_WIDTH, height);
    this.rect.body.setSize(PADDLE_WIDTH, height, true);
  }

  resetHeightScale() {
    this.setHeightScale(1);
  }
}
