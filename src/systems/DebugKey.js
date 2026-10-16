import { POWERUP_DEFINITIONS } from "../config.js";

// Tecla de prueba para desarrollo: durante una partida, apretar DEBUG_KEY
// ejecuta lo que se esté probando en el momento. Solo funciona con el
// servidor de desarrollo (npm run dev); en el build publicado no hace nada.
//
// Para probar otra cosa, se cambia DEBUG_POWERUP_ID (o el contenido de run).

const DEBUG_KEY = "G";

// Qué se prueba ahora: activar este power-up sobre la pelota en juego, como si
// la pelota lo hubiera agarrado. En los verdes y rojos cuenta siempre como si
// la hubiera mandado el jugador 1 (el verde es para él; el rojo, para el rival).
const DEBUG_POWERUP_ID = "cannon-green";

export default class DebugKey {
  constructor(scene) {
    this.scene = scene;
    if (!import.meta.env.DEV) return;

    scene.input.keyboard.on(`keydown-${DEBUG_KEY}`, () => this.run());
  }

  run() {
    const ball = this.scene.ballManager.primary;
    const definition = POWERUP_DEFINITIONS.find((item) => item.id === DEBUG_POWERUP_ID);
    if (!ball || !definition || this.scene.matchOver) return;

    const lastTouchedBy = ball.lastTouchedBy;
    ball.lastTouchedBy = "p1";
    this.scene.onPowerUpActivated(definition, ball);
    ball.lastTouchedBy = lastTouchedBy ?? "p1";
  }
}
