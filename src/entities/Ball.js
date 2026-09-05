import Phaser from "phaser";
import {
  BALL_SIZE,
  BALL_SPEED,
  BALL_MAX_BOUNCE_ANGLE,
  BALL_SPEED_INCREMENT,
  BALL_MAX_SPEED,
  BALL_TURBO_MULTIPLIER,
  COLORS,
} from "../config.js";

export default class Ball {
  constructor(scene, x, y) {
    this.circle = scene.add.circle(x, y, BALL_SIZE / 2, COLORS.BALL);
    scene.physics.add.existing(this.circle);
    this.circle.body.setCircle(BALL_SIZE / 2);
    this.circle.body.setCollideWorldBounds(true);
    this.circle.body.setBounce(1, 1);

    this.speed = BALL_SPEED;
    this.lastTouchedBy = null;
  }

  get x() {
    return this.circle.x;
  }

  get y() {
    return this.circle.y;
  }

  get velocityX() {
    return this.circle.body.velocity.x;
  }

  launch(directionX = null) {
    this.speed = BALL_SPEED;

    const dir = directionX ?? (Math.random() < 0.5 ? -1 : 1);
    const angle = Phaser.Math.FloatBetween(-BALL_MAX_BOUNCE_ANGLE / 2, BALL_MAX_BOUNCE_ANGLE / 2);

    this.circle.body.setVelocity(Math.cos(angle) * this.speed * dir, Math.sin(angle) * this.speed);
  }

  bounceOffPaddle(offsetRatio, directionX) {
    // Sube la velocidad con cada rebote, pero si ya está por encima del tope
    // (por un Turbo previo) no la baja: se queda congelada en ese nivel.
    this.speed = Math.max(this.speed, Math.min(this.speed * BALL_SPEED_INCREMENT, BALL_MAX_SPEED));

    const angle = offsetRatio * BALL_MAX_BOUNCE_ANGLE;
    this.circle.body.setVelocity(
      Math.cos(angle) * this.speed * directionX,
      Math.sin(angle) * this.speed
    );
  }

  applyTurbo() {
    this.speed *= BALL_TURBO_MULTIPLIER;

    const body = this.circle.body;
    const currentAngle = Math.atan2(body.velocity.y, body.velocity.x);
    body.setVelocity(Math.cos(currentAngle) * this.speed, Math.sin(currentAngle) * this.speed);
  }

  resetPosition(x, y) {
    this.circle.body.reset(x, y);
    this.speed = BALL_SPEED;
    this.lastTouchedBy = null;
  }

  destroy() {
    this.circle.destroy();
  }
}
