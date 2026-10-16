import { POWERUP_DEFINITIONS } from "../config.js";

const ICON_GRID_COLUMNS = 9;
const ICON_GRID_SPACING = 56;

// Tecla de prueba para desarrollo: durante una partida, apretar DEBUG_KEY
// ejecuta lo que se esté probando en el momento. Solo funciona con el
// servidor de desarrollo (npm run dev); en el build publicado no hace nada.
//
// Para probar otra cosa, se cambia DEBUG_ACTION (y DEBUG_POWERUP_ID si hace falta).

const DEBUG_KEY = "G";

// Qué se prueba ahora:
// - "playerPoint": le suma un punto al jugador 1 (sirve para avanzar las fases
//   del jefe final sin jugar cada punto).
// - "allPowerUps": pone en la cancha los 27 power-ups juntos (9 × 3), para
//   ver sus íconos; se pueden agarrar con la pelota como cualquier otro.
// - "powerUp": activa DEBUG_POWERUP_ID sobre la pelota en juego, como si la
//   pelota lo hubiera agarrado. En los verdes y rojos cuenta siempre como si la
//   hubiera mandado el jugador 1 (el verde es para él; el rojo, para el rival).
const DEBUG_ACTION = "allPowerUps";
const DEBUG_POWERUP_ID = "cannon-green";

export default class DebugKey {
  constructor(scene) {
    this.scene = scene;
    if (!import.meta.env.DEV) return;

    scene.input.keyboard.on(`keydown-${DEBUG_KEY}`, () => this.run());
  }

  run() {
    if (this.scene.matchOver) return;

    if (DEBUG_ACTION === "playerPoint") {
      this.scene.awardPoint("p1");
    } else if (DEBUG_ACTION === "allPowerUps") {
      this.spawnAllPowerUps();
    } else {
      this.activatePowerUp();
    }
  }

  spawnAllPowerUps() {
    const field = this.scene.physics.world.bounds;
    const rows = Math.ceil(POWERUP_DEFINITIONS.length / ICON_GRID_COLUMNS);

    POWERUP_DEFINITIONS.forEach((definition, index) => {
      const column = index % ICON_GRID_COLUMNS;
      const row = Math.floor(index / ICON_GRID_COLUMNS);
      const x = field.centerX + (column - (ICON_GRID_COLUMNS - 1) / 2) * ICON_GRID_SPACING;
      const y = field.centerY + (row - (rows - 1) / 2) * ICON_GRID_SPACING;
      this.scene.powerUpSpawner.spawnAt(definition, x, y);
    });
  }

  activatePowerUp() {
    const ball = this.scene.ballManager.primary;
    const definition = POWERUP_DEFINITIONS.find((item) => item.id === DEBUG_POWERUP_ID);
    if (!ball || !definition) return;

    const lastTouchedBy = ball.lastTouchedBy;
    ball.lastTouchedBy = "p1";
    this.scene.onPowerUpActivated(definition, ball);
    ball.lastTouchedBy = lastTouchedBy ?? "p1";
  }
}
