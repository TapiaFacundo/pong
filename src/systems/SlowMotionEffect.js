import { SLOW_MOTION_TIME_SCALE, SLOW_MOTION_TINT, SLOW_MOTION_TINT_ALPHA } from "../config.js";

// Power-up amarillo "Cámara lenta": todo lo que se mueve en la cancha
// (pelotas, palas, IA) va más despacio durante un rato. Frena solo la física:
// los relojes de los power-ups, del sabotaje y de la IA siguen en tiempo real.
// Mientras dura, la cancha se tiñe de azul.
export default class SlowMotionEffect {
  constructor(scene, field) {
    this.scene = scene;
    this.expireTimer = null;

    this.tint = scene.add
      .rectangle(field.centerX, field.centerY, field.width, field.height, SLOW_MOTION_TINT, SLOW_MOTION_TINT_ALPHA)
      .setDepth(10)
      .setVisible(false);

    // La física sobrevive entre partidas (Phaser reutiliza la escena): que no
    // arranque una partida en cámara lenta.
    scene.physics.world.timeScale = 1;
  }

  get isActive() {
    return this.expireTimer !== null;
  }

  // Volver a agarrarlo reinicia el tiempo.
  activate(duration) {
    this.clear();

    this.scene.physics.world.timeScale = SLOW_MOTION_TIME_SCALE;
    this.tint.setVisible(true);
    this.expireTimer = this.scene.time.delayedCall(duration, () => this.clear());
  }

  clear() {
    if (this.expireTimer) {
      this.expireTimer.remove();
      this.expireTimer = null;
    }
    this.scene.physics.world.timeScale = 1;
    this.tint.setVisible(false);
  }
}
