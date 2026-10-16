import { SMALL_GOAL_COLOR, SMALL_GOAL_COVERAGE } from "../config.js";
import GoalBarrier from "../entities/GoalBarrier.js";
import { playPaddleHit } from "./SoundEffects.js";

// Power-up "Arco chico": dos paredes sobre la línea del arco de un lado, una
// en cada punta, que tapan SMALL_GOAL_COVERAGE del alto cada una. La pelota que
// las toca rebota hacia la cancha. A diferencia del escudo no se rompen: duran
// hasta que vence su tiempo o termina la ronda. Puede haber un arco chico por lado.
export default class SmallGoalEffect {
  constructor(scene, field) {
    this.scene = scene;
    this.field = field;
    this.goals = {}; // side -> { barriers, expireTimer }
  }

  // Volver a agarrarlo para el mismo lado reinicia el tiempo.
  activate(side, duration) {
    this.clear(side);

    const wallHeight = this.field.height * SMALL_GOAL_COVERAGE;
    const barriers = [
      new GoalBarrier(this.scene, this.field, side, { top: 0, bottom: wallHeight, color: SMALL_GOAL_COLOR }),
      new GoalBarrier(this.scene, this.field, side, {
        top: this.field.height - wallHeight,
        bottom: this.field.height,
        color: SMALL_GOAL_COLOR,
      }),
    ];
    const expireTimer = this.scene.time.delayedCall(duration, () => this.clear(side));

    this.goals[side] = { barriers, expireTimer };
  }

  update(balls) {
    for (const { barriers } of Object.values(this.goals)) {
      for (const barrier of barriers) {
        const ball = balls.find((candidate) => barrier.blocks(candidate));
        if (!ball) continue;

        barrier.bounce(ball);
        playPaddleHit();
      }
    }
  }

  clear(side) {
    const goal = this.goals[side];
    if (!goal) return;

    goal.expireTimer.remove();
    goal.barriers.forEach((barrier) => barrier.destroy());
    delete this.goals[side];
  }

  clearAll() {
    Object.keys(this.goals).forEach((side) => this.clear(side));
  }
}
