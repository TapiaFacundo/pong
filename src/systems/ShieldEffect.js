import { SHIELD_COLOR } from "../config.js";
import GoalBarrier from "../entities/GoalBarrier.js";
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
    this.shields = {}; // side -> { barrier, expireTimer }
  }

  // Volver a agarrar un escudo para el mismo lado reinicia el tiempo (no suma usos).
  activate(side, duration) {
    this.clear(side);

    const barrier = new GoalBarrier(this.scene, this.field, side, {
      top: 0,
      bottom: this.field.height,
      color: SHIELD_COLOR,
    });
    const expireTimer = this.scene.time.delayedCall(duration, () => this.clear(side));

    this.shields[side] = { barrier, expireTimer };
  }

  update(balls) {
    for (const [side, { barrier }] of Object.entries(this.shields)) {
      const ball = balls.find((candidate) => barrier.blocks(candidate));
      if (!ball) continue;

      barrier.bounce(ball);
      ball.lastTouchedBy = side;
      this.feedback.spawnBurst(barrier.x, ball.y, SHIELD_COLOR);
      playPaddleHit();
      this.clear(side);
    }
  }

  clear(side) {
    const shield = this.shields[side];
    if (!shield) return;

    shield.expireTimer.remove();
    shield.barrier.destroy();
    delete this.shields[side];
  }

  clearAll() {
    Object.keys(this.shields).forEach((side) => this.clear(side));
  }
}
