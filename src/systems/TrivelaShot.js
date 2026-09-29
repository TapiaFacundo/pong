import { COLORS, POWERUP_COLORS, TRIVELA_TELL_BLINK_INTERVAL } from "../config.js";
import CurveMotion from "./CurveMotion.js";

// Habilidad del rival Trivela (nivel 6 y fase 2 del jefe final): algunos de
// sus tiros salen con efecto. Cada vez que una pelota empieza a ir hacia el
// rival se decide (con `chance`) si su próximo golpe será un tiro con efecto,
// y mientras la pelota se acerca su pala parpadea en amarillo como aviso.
//
// El tiro con efecto es como un golpe en la punta de la pala: sale abierto
// hacia el lado donde pegó la pelota y se curva de vuelta con la fuerza
// máxima de la bola curva. El efecto dura solo ese tiro.
//
// Se engancha a BallManager como "modificador de golpe" (beforeBounce /
// afterBounce) y necesita update() cada frame.
export default class TrivelaShot {
  constructor(scene, rivalPaddle, rivalId, { chance }) {
    this.scene = scene;
    this.paddle = rivalPaddle;
    this.rivalId = rivalId;
    this.chance = chance;
    this.direction = rivalId === "p2" ? 1 : -1; // hacia dónde va la pelota cuando se acerca al rival

    this.approaching = new Set(); // pelotas ya evaluadas en este viaje hacia el rival
    this.armedBalls = new Set(); // pelotas cuyo próximo golpe del rival sale con efecto
    this.shotMotions = new Map(); // pelota -> efecto del último tiro con efecto
    this.pendingShot = null;
  }

  update(balls) {
    for (const ball of balls) {
      const towardRival = Math.sign(ball.velocityX) === this.direction;

      if (towardRival && !this.approaching.has(ball)) {
        this.approaching.add(ball);
        if (Math.random() < this.chance) this.armedBalls.add(ball);
      } else if (!towardRival) {
        this.approaching.delete(ball);
        this.armedBalls.delete(ball);
      }
    }

    this.forgetRemovedBalls(balls);
    this.updateTell();
  }

  forgetRemovedBalls(balls) {
    for (const set of [this.approaching, this.armedBalls]) {
      for (const ball of set) if (!balls.includes(ball)) set.delete(ball);
    }
    for (const ball of this.shotMotions.keys()) if (!balls.includes(ball)) this.shotMotions.delete(ball);
  }

  // Devuelve el offset (-1..1) con el que rebota la pelota en la pala.
  beforeBounce(ball, playerId, offsetRatio) {
    // Cualquier golpe corta la curva del tiro con efecto anterior.
    const previousMotion = this.shotMotions.get(ball);
    if (previousMotion) {
      ball.removeMotion(previousMotion);
      this.shotMotions.delete(ball);
    }

    if (playerId !== this.rivalId || !this.armedBalls.has(ball)) return offsetRatio;

    this.armedBalls.delete(ball);
    this.pendingShot = ball;

    const side = offsetRatio === 0 ? (Math.random() < 0.5 ? -1 : 1) : Math.sign(offsetRatio);
    return side;
  }

  afterBounce(ball, playerId, offsetRatio) {
    if (this.pendingShot !== ball) return;
    this.pendingShot = null;

    // Si la pelota ya tiene el power-up de bola curva, ese efecto ya curva
    // este golpe de punta: no se suma una segunda curva.
    const hasCurvePowerUp = [...ball.motions].some((motion) => motion instanceof CurveMotion);
    if (hasCurvePowerUp) return;

    const motion = new CurveMotion();
    ball.addMotion(motion);
    motion.onPaddleHit(ball, offsetRatio);
    this.shotMotions.set(ball, motion);
  }

  updateTell() {
    if (this.armedBalls.size === 0) {
      this.paddle.rect.fillColor = COLORS.PADDLE;
      return;
    }

    const blinkOn = Math.floor(this.scene.time.now / TRIVELA_TELL_BLINK_INTERVAL) % 2 === 0;
    this.paddle.rect.fillColor = blinkOn ? POWERUP_COLORS.yellow : COLORS.PADDLE;
  }

  clear() {
    this.approaching.clear();
    this.armedBalls.clear();
    this.shotMotions.clear();
    this.pendingShot = null;
    this.paddle.rect.fillColor = COLORS.PADDLE;
  }
}
