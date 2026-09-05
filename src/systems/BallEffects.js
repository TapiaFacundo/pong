import Phaser from "phaser";
import {
  POWERUP_EFFECT_DURATION,
  BALL_ERRATIC_JITTER_INTERVAL,
  BALL_ERRATIC_JITTER_ANGLE,
  BALL_INVISIBLE_BLINK_INTERVAL,
} from "../config.js";

export default class BallEffects {
  constructor(scene) {
    this.scene = scene;
    this.erraticTimers = new Map();
    this.invisibleTimers = new Map();
  }

  applyErratic(ball) {
    this.clearErratic(ball);

    const jitterEvent = this.scene.time.addEvent({
      delay: BALL_ERRATIC_JITTER_INTERVAL,
      loop: true,
      callback: () => this.jitterBall(ball),
    });
    const expireEvent = this.scene.time.delayedCall(POWERUP_EFFECT_DURATION, () => this.clearErratic(ball));

    this.erraticTimers.set(ball, { jitterEvent, expireEvent });
  }

  jitterBall(ball) {
    if (!ball.circle.body) {
      this.clearErratic(ball);
      return;
    }

    const body = ball.circle.body;
    const currentAngle = Math.atan2(body.velocity.y, body.velocity.x);
    const newAngle = currentAngle + Phaser.Math.FloatBetween(-BALL_ERRATIC_JITTER_ANGLE, BALL_ERRATIC_JITTER_ANGLE);
    body.setVelocity(Math.cos(newAngle) * ball.speed, Math.sin(newAngle) * ball.speed);
  }

  clearErratic(ball) {
    const timers = this.erraticTimers.get(ball);
    if (!timers) return;

    timers.jitterEvent.remove();
    timers.expireEvent.remove();
    this.erraticTimers.delete(ball);
  }

  applyInvisible(ball) {
    this.clearInvisible(ball);

    const blinkEvent = this.scene.time.addEvent({
      delay: BALL_INVISIBLE_BLINK_INTERVAL,
      loop: true,
      callback: () => {
        if (!ball.circle.body) {
          this.clearInvisible(ball);
          return;
        }
        ball.circle.setVisible(!ball.circle.visible);
      },
    });
    const expireEvent = this.scene.time.delayedCall(POWERUP_EFFECT_DURATION, () => this.clearInvisible(ball));

    this.invisibleTimers.set(ball, { blinkEvent, expireEvent });
  }

  clearInvisible(ball) {
    const timers = this.invisibleTimers.get(ball);
    if (!timers) return;

    timers.blinkEvent.remove();
    timers.expireEvent.remove();
    this.invisibleTimers.delete(ball);

    if (ball.circle.body) ball.circle.setVisible(true);
  }

  clearAll() {
    Array.from(this.erraticTimers.keys()).forEach((ball) => this.clearErratic(ball));
    Array.from(this.invisibleTimers.keys()).forEach((ball) => this.clearInvisible(ball));
  }
}
