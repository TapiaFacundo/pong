import { COLORS, TRICK_SHOT_TELL_BLINK_INTERVAL, TRICK_SHOT_TELL_COLORS } from "../config.js";
import CurveMotion from "./CurveMotion.js";
import ZigzagMotion from "./ZigzagMotion.js";
import { playTrickShotTell } from "./SoundEffects.js";

const SHOT_MOTIONS = { curve: CurveMotion, zigzag: ZigzagMotion };

// Habilidad de Palinho Jr. (nivel 6) y de la fase 2 del jefe final: alterna
// tiros rectos, curvos y en zigzag. Cada vez que una pelota empieza a ir hacia
// el rival se sortea (según `weights`) cómo va a salir su próximo golpe, y
// mientras la pelota se acerca su pala parpadea como aviso: en amarillo si
// viene curvo y en celeste si viene en zigzag, y suena un aviso distinto para
// cada uno (el recto no avisa).
//
// - Curvo: como un golpe en la punta de la pala: sale abierto hacia el lado
//   donde pegó la pelota y se curva de vuelta con la fuerza máxima de la bola curva.
// - Zigzag: sale con el ángulo normal y ondula como la bola zigzagueante.
// El efecto dura solo ese tiro: el próximo golpe de cualquiera lo corta.
//
// Se engancha a BallManager como "modificador de golpe" (beforeBounce /
// afterBounce) y necesita update() cada frame.
export default class TrickShot {
  // weights: chance relativa de cada tiro, { normal, curve, zigzag }.
  constructor(scene, rivalPaddle, rivalId, { weights }) {
    this.scene = scene;
    this.paddle = rivalPaddle;
    this.rivalId = rivalId;
    this.weights = weights;
    this.direction = rivalId === "p2" ? 1 : -1; // hacia dónde va la pelota cuando se acerca al rival

    this.approaching = new Set(); // pelotas ya sorteadas en este viaje hacia el rival
    this.armedBalls = new Map(); // pelota -> tiro con efecto que sale en el próximo golpe del rival
    this.shotMotions = new Map(); // pelota -> efecto del último tiro con efecto
    this.pendingShot = null; // { ball, kind } entre beforeBounce y afterBounce
  }

  pickShot() {
    const entries = Object.entries(this.weights);
    const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
    let roll = Math.random() * total;
    for (const [kind, weight] of entries) {
      roll -= weight;
      if (roll < 0) return kind;
    }
    return "normal";
  }

  update(balls) {
    for (const ball of balls) {
      const towardRival = Math.sign(ball.velocityX) === this.direction;

      if (towardRival && !this.approaching.has(ball)) {
        this.approaching.add(ball);
        const kind = this.pickShot();
        if (kind !== "normal") {
          this.armedBalls.set(ball, kind);
          playTrickShotTell(kind);
        }
      } else if (!towardRival) {
        this.approaching.delete(ball);
        this.armedBalls.delete(ball);
      }
    }

    this.forgetRemovedBalls(balls);
    this.updateTell();
  }

  forgetRemovedBalls(balls) {
    for (const ball of this.approaching) if (!balls.includes(ball)) this.approaching.delete(ball);
    for (const map of [this.armedBalls, this.shotMotions]) {
      for (const ball of map.keys()) if (!balls.includes(ball)) map.delete(ball);
    }
  }

  // Devuelve el offset (-1..1) con el que rebota la pelota en la pala.
  beforeBounce(ball, playerId, offsetRatio) {
    // Cualquier golpe corta el efecto del tiro anterior.
    const previousMotion = this.shotMotions.get(ball);
    if (previousMotion) {
      ball.removeMotion(previousMotion);
      this.shotMotions.delete(ball);
    }

    const kind = this.armedBalls.get(ball);
    if (playerId !== this.rivalId || !kind) return offsetRatio;

    this.armedBalls.delete(ball);
    this.pendingShot = { ball, kind };

    // El curvo sale como un golpe en la punta; el zigzag, con el ángulo normal.
    if (kind !== "curve") return offsetRatio;
    return offsetRatio === 0 ? (Math.random() < 0.5 ? -1 : 1) : Math.sign(offsetRatio);
  }

  afterBounce(ball, playerId, offsetRatio) {
    if (this.pendingShot?.ball !== ball) return;
    const { kind } = this.pendingShot;
    this.pendingShot = null;

    // Si la pelota ya tiene ese efecto por un power-up, no se suma otro igual.
    const MotionClass = SHOT_MOTIONS[kind];
    if ([...ball.motions].some((motion) => motion instanceof MotionClass)) return;

    const motion = new MotionClass();
    ball.addMotion(motion);
    motion.onPaddleHit?.(ball, offsetRatio);
    this.shotMotions.set(ball, motion);
  }

  updateTell() {
    const [kind] = this.armedBalls.values();
    if (!kind) {
      this.paddle.rect.fillColor = COLORS.PADDLE;
      return;
    }

    const blinkOn = Math.floor(this.scene.time.now / TRICK_SHOT_TELL_BLINK_INTERVAL) % 2 === 0;
    this.paddle.rect.fillColor = blinkOn ? TRICK_SHOT_TELL_COLORS[kind] : COLORS.PADDLE;
  }

  clear() {
    this.approaching.clear();
    this.armedBalls.clear();
    this.shotMotions.clear();
    this.pendingShot = null;
    this.paddle.rect.fillColor = COLORS.PADDLE;
  }
}
