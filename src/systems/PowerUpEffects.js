import {
  POWERUP_EFFECT_DURATION,
  PADDLE_GROW_SCALE,
  PADDLE_SHRINK_SCALE,
  PADDLE_SPEED_UP_SCALE,
  PADDLE_SPEED_DOWN_SCALE,
} from "../config.js";

const BUFF_KINDS = ["grow", "speedUp", "doublePoint", "shield", "smallGoal", "cannon"];

// Si un efecto le conviene al lado que lo recibe (pala grande, escudo...) o lo perjudica.
export function isBuffKind(kind) {
  return BUFF_KINDS.includes(kind);
}
const HEIGHT_KINDS = ["grow", "shrink"];
const SPEED_KINDS = ["speedUp", "slowDown"];

export default class PowerUpEffects {
  // paddlesBySide: { p1: pala, p2: pala }. Un lado puede sumar más palas con
  // addPaddle (la pala adelantada de Los Gemelos): los efectos de pala de ese
  // lado se aplican a todas. duration: cuánto duran los de los power-ups
  // (puede cambiarla un modificador de la Batalla).
  constructor(scene, paddlesBySide, { duration = POWERUP_EFFECT_DURATION } = {}) {
    this.scene = scene;
    this.duration = duration;
    // En el Arcade no hay pala del lado p2: queda sin palas.
    this.paddlesBySide = { p1: [paddlesBySide.p1], p2: paddlesBySide.p2 ? [paddlesBySide.p2] : [] };
    this.timers = { p1: {}, p2: {} };
  }

  addPaddle(side, paddle) {
    this.paddlesBySide[side].push(paddle);
  }

  // A quién afecta un power-up de color: verde/rojo siguen siempre el mismo
  // patrón (verde = a favor de quien lo agarra, rojo = a favor del rival),
  // sea el efecto sobre una pala o, como con "punto doble", sobre el puntaje.
  resolveTarget(kind, colorCategory, attackerSide) {
    if (!attackerSide) return null;

    const defenderSide = attackerSide === "p1" ? "p2" : "p1";
    const isBuff = BUFF_KINDS.includes(kind);
    return isBuff === (colorCategory === "green") ? attackerSide : defenderSide;
  }

  // Devuelve a qué lado se aplicó y el temporizador del efecto (o null si
  // nadie había tocado la pelota todavía).
  applyPaddleEffect(kind, colorCategory, attackerSide) {
    const targetSide = this.resolveTarget(kind, colorCategory, attackerSide);
    if (!targetSide) return null;

    return { side: targetSide, timer: this.applyToSide(targetSide, kind, this.duration) };
  }

  // Aplica un efecto de pala a todas las palas de un lado durante `duration`
  // ms. Un efecto del mismo tipo (tamaño, velocidad o controles) reemplaza al
  // anterior. Lo usan los power-ups y el sabotaje del Saboteador. Devuelve el
  // temporizador del efecto.
  applyToSide(side, kind, duration) {
    const slot = this.slotForKind(kind);
    const paddles = this.paddlesBySide[side];

    this.clearSlot(side, slot);
    paddles.forEach((paddle) => this.applyKind(paddle, kind));

    this.timers[side][slot] = this.scene.time.delayedCall(duration, () => {
      paddles.forEach((paddle) => this.revertSlot(paddle, slot));
      delete this.timers[side][slot];
    });

    return this.timers[side][slot];
  }

  slotForKind(kind) {
    if (HEIGHT_KINDS.includes(kind)) return "height";
    if (SPEED_KINDS.includes(kind)) return "speed";
    return "invert";
  }

  applyKind(paddle, kind) {
    switch (kind) {
      case "grow":
        paddle.setHeightScale(PADDLE_GROW_SCALE);
        break;
      case "shrink":
        paddle.setHeightScale(PADDLE_SHRINK_SCALE);
        break;
      case "speedUp":
        paddle.setSpeedScale(PADDLE_SPEED_UP_SCALE);
        break;
      case "slowDown":
        paddle.setSpeedScale(PADDLE_SPEED_DOWN_SCALE);
        break;
      case "invert":
        paddle.invertControls = true;
        break;
    }
  }

  revertSlot(paddle, slot) {
    if (slot === "height") paddle.resetHeightScale();
    else if (slot === "speed") paddle.resetSpeed();
    else if (slot === "invert") paddle.invertControls = false;
  }

  clearSlot(side, slot) {
    const timer = this.timers[side][slot];
    if (timer) {
      timer.remove();
      delete this.timers[side][slot];
    }
    this.paddlesBySide[side].forEach((paddle) => this.revertSlot(paddle, slot));
  }

  clearAll() {
    for (const side of Object.keys(this.paddlesBySide)) {
      this.clearSlot(side, "height");
      this.clearSlot(side, "speed");
      this.clearSlot(side, "invert");
    }
  }
}
