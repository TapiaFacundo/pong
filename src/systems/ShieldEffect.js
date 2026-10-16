import { SHIELD_COLOR, SHIELD_WIDTH, SHIELD_OFFSET_X } from "../config.js";
import { playPaddleHit } from "./SoundEffects.js";

// Power-up "Escudo": una barrera celeste detrás de la pala, a lo alto de todo
// el arco, que salva un gol. La primera pelota que llega rebota hacia la
// cancha y el escudo se rompe. Dura un uso, o hasta que vence su tiempo o
// termina la ronda. Puede haber uno por lado.
//
// En vez de registrar colisiones por pelota, revisa en cada frame si alguna
// pelota llegó al escudo: así funciona igual con bola extra o varias pelotas.
export default class ShieldEffect {
  constructor(scene, field, feedback) {
    this.scene = scene;
    this.field = field;
    this.feedback = feedback;
    this.shields = {}; // side -> { rect, expireTimer, direction }
  }

  // Volver a agarrar un escudo para el mismo lado reinicia el tiempo (no suma usos).
  activate(side, duration) {
    this.clear(side);

    const x = side === "p1" ? SHIELD_OFFSET_X : this.field.width - SHIELD_OFFSET_X;
    const rect = this.scene.add.rectangle(x, this.field.centerY, SHIELD_WIDTH, this.field.height, SHIELD_COLOR, 0.85);
    const expireTimer = this.scene.time.delayedCall(duration, () => this.clear(side));
    // Hacia dónde rebota la pelota: hacia la cancha.
    const direction = side === "p1" ? 1 : -1;

    this.shields[side] = { rect, expireTimer, direction };
  }

  update(balls) {
    for (const [side, shield] of Object.entries(this.shields)) {
      const ball = balls.find((candidate) => this.reaches(candidate, shield));
      if (ball) this.block(side, shield, ball);
    }
  }

  // Borde de la barrera que mira hacia la cancha.
  faceX(shield) {
    return shield.rect.x + (shield.direction * SHIELD_WIDTH) / 2;
  }

  // Una pelota que va hacia el arco y ya toca la barrera.
  reaches(ball, shield) {
    const goingToGoal = Math.sign(ball.velocityX) === -shield.direction;
    if (!goingToGoal) return false;

    // Posición de la física (ya actualizada en este frame); la del dibujo
    // recién se copia al final del frame y llegaría un frame tarde.
    const ballX = ball.circle.body.center.x;
    const face = this.faceX(shield);
    return shield.direction > 0 ? ballX - ball.radius <= face : ballX + ball.radius >= face;
  }

  block(side, shield, ball) {
    // A alta velocidad la pelota puede haberse metido unos px en la barrera:
    // se la acomoda justo contra la cara antes de rebotar. Se mueve solo la
    // física: al final del frame Phaser le pasa ese movimiento al dibujo.
    const body = ball.circle.body;
    const correctedX = this.faceX(shield) + shield.direction * ball.radius;
    body.x += correctedX - body.center.x;
    body.updateCenter();

    const velocity = body.velocity;
    ball.setDirection(Math.abs(velocity.x) * shield.direction, velocity.y);
    ball.lastTouchedBy = side;

    this.feedback.spawnBurst(shield.rect.x, ball.y, SHIELD_COLOR);
    playPaddleHit();
    this.clear(side);
  }

  clear(side) {
    const shield = this.shields[side];
    if (!shield) return;

    shield.expireTimer.remove();
    shield.rect.destroy();
    delete this.shields[side];
  }

  clearAll() {
    Object.keys(this.shields).forEach((side) => this.clear(side));
  }
}
