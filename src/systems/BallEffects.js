import { POWERUP_EFFECT_DURATION, BALL_INVISIBLE_BLINK_INTERVAL, BALL_GIANT_SCALE } from "../config.js";
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
    this.giantTimers = new Map();
    this.motionTimers = { zigzag: new Map(), curve: new Map() };
  }

  // Pelota gigante: la pelota crece durante POWERUP_EFFECT_DURATION. Volver a
  // agarrarlo reinicia el tiempo (no la agranda más). Los apply* devuelven el
  // temporizador del efecto.
  applyGiant(ball) {
    this.clearGiant(ball);

    ball.setSizeScale(BALL_GIANT_SCALE);
    const expireEvent = this.scene.time.delayedCall(POWERUP_EFFECT_DURATION, () => this.clearGiant(ball));
    this.giantTimers.set(ball, expireEvent);
    return expireEvent;
  }

  clearGiant(ball) {
    const expireEvent = this.giantTimers.get(ball);
    if (!expireEvent) return;

    expireEvent.remove();
    this.giantTimers.delete(ball);
    if (ball.circle.body) ball.setSizeScale(1);
  }

  // Efectos que cambian la trayectoria de una pelota (zigzag, curva) durante
  // POWERUP_EFFECT_DURATION. Volver a agarrar el mismo reinicia el tiempo.
  applyMotion(ball, kind) {
    this.clearMotion(ball, kind);

    const motion = new MOTION_CLASSES[kind]();
    ball.addMotion(motion);
    const expireEvent = this.scene.time.delayedCall(POWERUP_EFFECT_DURATION, () => this.clearMotion(ball, kind));

    this.motionTimers[kind].set(ball, { motion, expireEvent });
    return expireEvent;
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
    // La IA lo lee para errar más mientras dura el efecto.
    ball.isInvisible = true;
    return expireEvent;
  }

  clearInvisible(ball) {
    const timers = this.invisibleTimers.get(ball);
    if (!timers) return;

    timers.blinkEvent.remove();
    timers.expireEvent.remove();
    this.invisibleTimers.delete(ball);
    ball.isInvisible = false;

    if (ball.circle.body) ball.circle.setVisible(true);
  }

  // Saca todos los efectos de una pelota (por ejemplo, cuando sale de la cancha).
  clearBall(ball) {
    this.clearInvisible(ball);
    this.clearGiant(ball);
    Object.keys(this.motionTimers).forEach((kind) => this.clearMotion(ball, kind));
  }

  clearAll() {
    Array.from(this.invisibleTimers.keys()).forEach((ball) => this.clearInvisible(ball));
    Array.from(this.giantTimers.keys()).forEach((ball) => this.clearGiant(ball));
    for (const kind of Object.keys(this.motionTimers)) {
      Array.from(this.motionTimers[kind].keys()).forEach((ball) => this.clearMotion(ball, kind));
    }
  }
}
