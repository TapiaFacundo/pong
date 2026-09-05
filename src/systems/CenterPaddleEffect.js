import Phaser from "phaser";
import { CENTER_PADDLE_HEIGHT } from "../config.js";
import CenterPaddle from "../entities/CenterPaddle.js";
import { playPaddleHit } from "./SoundEffects.js";

export default class CenterPaddleEffect {
  constructor(scene, ballManager) {
    this.scene = scene;
    this.ballManager = ballManager;
    this.centerPaddle = null;
    this.expireTimer = null;
  }

  get isActive() {
    return !!this.centerPaddle;
  }

  activate(duration) {
    this.clear();

    this.centerPaddle = new CenterPaddle(this.scene);
    this.ballManager.balls.forEach((ball) => this.registerBall(ball));
    this.expireTimer = this.scene.time.delayedCall(duration, () => this.clear());
  }

  registerBall(ball) {
    if (!this.centerPaddle) return;

    this.scene.physics.add.collider(ball.circle, this.centerPaddle.rect, () => this.handleHit(ball));
  }

  handleHit(ball) {
    const offset = Phaser.Math.Clamp(
      (ball.y - this.centerPaddle.y) / (CENTER_PADDLE_HEIGHT / 2),
      -1,
      1
    );
    ball.circle.body.velocity.y = offset * Math.abs(ball.circle.body.velocity.x);
    playPaddleHit();
  }

  clear() {
    if (this.expireTimer) {
      this.expireTimer.remove();
      this.expireTimer = null;
    }
    if (this.centerPaddle) {
      this.centerPaddle.destroy();
      this.centerPaddle = null;
    }
  }
}
