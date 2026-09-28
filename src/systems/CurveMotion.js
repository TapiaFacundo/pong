import Phaser from "phaser";
import {
  BALL_CURVE_MIN_OFFSET,
  BALL_CURVE_MAX_TURN_RATE,
  BALL_CURVE_DELAY,
  BALL_CURVE_DURATION,
  BALL_MAX_MOTION_ANGLE,
} from "../config.js";

// Efecto de movimiento "bola curva" (tiro de trivela): un golpe descentrado
// en la pala hace que la pelota salga con el ángulo normal y, al rato, se
// curve hacia el lado contrario. Cuanto más cerca de la punta, más curva.
// Los golpes en el centro de la pala salen rectos.
export default class CurveMotion {
  constructor() {
    this.active = false;
  }

  onPaddleHit(ball, offsetRatio) {
    const strength = (Math.abs(offsetRatio) - BALL_CURVE_MIN_OFFSET) / (1 - BALL_CURVE_MIN_OFFSET);
    if (strength <= 0) {
      this.active = false;
      return;
    }

    this.start(strength, offsetRatio < 0 ? 1 : -1);
  }

  // strength: 0..1. turnSign: 1 = se curva hacia abajo, -1 = hacia arriba.
  // Un golpe con la punta de arriba sale hacia arriba y se curva hacia abajo.
  start(strength, turnSign) {
    this.active = true;
    this.elapsed = 0;
    this.turnRate = BALL_CURVE_MAX_TURN_RATE * strength;
    this.turnSign = turnSign;
  }

  update(ball, delta) {
    if (!this.active) return 0;

    this.elapsed += delta;
    if (this.elapsed < BALL_CURVE_DELAY) return 0;
    if (this.elapsed > BALL_CURVE_DELAY + BALL_CURVE_DURATION) {
      this.active = false;
      return 0;
    }

    // Tuerce la dirección base, con el mismo tope de ángulo que usa Ball:
    // la pelota nunca puede curvarse de vuelta hacia su propio arco.
    const forwardX = Math.sign(ball.heading.x) || 1;
    const angle = Phaser.Math.Clamp(
      Math.atan2(ball.heading.y, Math.abs(ball.heading.x)) + this.turnSign * this.turnRate * (delta / 1000),
      -BALL_MAX_MOTION_ANGLE,
      BALL_MAX_MOTION_ANGLE
    );
    ball.heading = { x: Math.cos(angle) * forwardX, y: Math.sin(angle) };

    return 0;
  }

  // Si la pelota rebota en una pared mientras curva, la curva se espeja con ella.
  onWallBounce(ball, headingFlipped) {
    if (headingFlipped) this.turnSign *= -1;
  }
}
