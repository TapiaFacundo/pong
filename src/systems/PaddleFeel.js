import { COLORS } from "../config.js";

// Pala rápida: mientras se mueve va dejando copias que se apagan.
const GHOST_INTERVAL = 35;
const GHOST_ALPHA = 0.3;
const GHOST_DURATION = 180;
// Pala lenta: se ve un poco apagada.
const SLOW_ALPHA = 0.55;

// Cómo se ven las palas con los power-ups de velocidad (Batalla, Modo
// Historia y Arcade): solo dibujo, no cambia nada del juego. Recorre las
// palas que conoce BallManager (también la adelantada de Los Gemelos).
export default class PaddleFeel {
  constructor(scene, ballManager) {
    this.scene = scene;
    this.ballManager = ballManager;
    this.lastGhost = new Map(); // pala -> momento de su última copia

    scene.events.on("postupdate", this.update, this);
    scene.events.once("shutdown", () => scene.events.off("postupdate", this.update, this));
  }

  update() {
    const now = this.scene.time.now;

    for (const { paddle } of this.ballManager.paddles) {
      paddle.rect.setAlpha(paddle.speed < paddle.baseSpeed ? SLOW_ALPHA : 1);

      const fast = paddle.speed > paddle.baseSpeed;
      const moving = paddle.rect.body.velocity.y !== 0;
      if (!fast || !moving || now - (this.lastGhost.get(paddle) ?? 0) < GHOST_INTERVAL) continue;

      this.lastGhost.set(paddle, now);
      this.spawnGhost(paddle.rect);
    }
  }

  spawnGhost(rect) {
    const ghost = this.scene.add.rectangle(rect.x, rect.y, rect.width, rect.height, COLORS.PADDLE, GHOST_ALPHA);
    // Detrás de la pala.
    ghost.setDepth(rect.depth - 1);

    this.scene.tweens.add({
      targets: ghost,
      alpha: 0,
      duration: GHOST_DURATION,
      onComplete: () => ghost.destroy(),
    });
  }
}
