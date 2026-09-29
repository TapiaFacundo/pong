import {
  POWERUP_EFFECT_DURATION,
  PADDLE_GROW_SCALE,
  PADDLE_SHRINK_SCALE,
  PADDLE_SPEED_UP_SCALE,
  PADDLE_SPEED_DOWN_SCALE,
} from "../config.js";

const BUFF_KINDS = ["grow", "speedUp", "doublePoint"];
const HEIGHT_KINDS = ["grow", "shrink"];
const SPEED_KINDS = ["speedUp", "slowDown"];

export default class PowerUpEffects {
  // paddlesBySide: { p1: pala, p2: pala }. Un lado puede sumar más palas con
  // addPaddle (la pala adelantada de Los Gemelos): los efectos de pala de ese
  // lado se aplican a todas.
  constructor(scene, paddlesBySide) {
    this.scene = scene;
    this.paddlesBySide = { p1: [paddlesBySide.p1], p2: [paddlesBySide.p2] };
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

  applyPaddleEffect(kind, colorCategory, attackerSide) {
    const targetSide = this.resolveTarget(kind, colorCategory, attackerSide);
    if (!targetSide) return null;

    const slot = this.slotForKind(kind);
    const paddles = this.paddlesBySide[targetSide];

    this.clearSlot(targetSide, slot);
    paddles.forEach((paddle) => this.applyKind(paddle, kind));

    this.timers[targetSide][slot] = this.scene.time.delayedCall(POWERUP_EFFECT_DURATION, () => {
      paddles.forEach((paddle) => this.revertSlot(paddle, slot));
      delete this.timers[targetSide][slot];
    });

    // La pala principal del lado afectado, para el destello de feedback.
    return paddles[0];
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
