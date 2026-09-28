import { POWERUP_EFFECT_DURATION, BALL_INVISIBLE_BLINK_INTERVAL } from "../config.js";
import ZigzagMotion from "./ZigzagMotion.js";
import CurveMotion from "./CurveMotion.js";

const MOTION_CLASSES = {
  zigzag: ZigzagMotion,
  curve: CurveMotion,
};

export default class BallEffects {
  constructor(scene) {
    this.scene = scene;
    this.invisibleTimers = new Map();
    this.motionTimers = { zigzag: new Map(), curve: new Map() };
  }

  // Efectos que cambian la trayectoria de una pelota (zigzag, curva) durante
  // POWERUP_EFFECT_DURATION. Volver a agarrar el mismo reinicia el tiempo.
  applyMotion(ball, kind) {
    this.clearMotion(ball, kind);

    const motion = new MOTION_CLASSES[kind]();
    ball.addMotion(motion);
    const expireEvent = this.scene.time.delayedCall(POWERUP_EFFECT_DURATION, () => this.clearMotion(ball, kind));

    this.motionTimers[kind].set(ball, { motion, expireEvent });
  }

  clearMotion(ball, kind) {
    const entry = this.motionTimers[kind].get(ball);
    if (!entry) return;

    entry.expireEvent.remove();
    this.motionTimers[kind].delete(ball);
    ball.removeMotion(entry.motion);
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
    Array.from(this.invisibleTimers.keys()).forEach((ball) => this.clearInvisible(ball));
    for (const kind of Object.keys(this.motionTimers)) {
      Array.from(this.motionTimers[kind].keys()).forEach((ball) => this.clearMotion(ball, kind));
    }
  }
}
