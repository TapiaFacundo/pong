import { POWERUP_DEFINITIONS } from "../config.js";
import { ARCADE_POWERUPS } from "../data/arcade.js";

const ICON_GRID_COLUMNS = 9;
const ICON_GRID_SPACING = 56;

// Tecla de prueba para desarrollo: durante una partida, apretar DEBUG_KEY
// ejecuta lo que se esté probando en el momento. Solo funciona con el
// servidor de desarrollo (npm run dev); en el build publicado no hace nada.
//
// Para probar otra cosa, se cambia DEBUG_ACTION (y DEBUG_POWERUP_ID si hace falta).

const DEBUG_KEY = "G";
const ARCADE_DEBUG_ACTION = "allCapsules";
const CAPSULE_ROW_START_X = 260;
const CAPSULE_ROW_SPACING = 60;

// En el Arcade, lo que se prueba lo dice ARCADE_DEBUG_ACTION:
// - "breakAllButOne": rompe todos los ladrillos menos uno (para probar el
//   paso de nivel sin jugarlo entero).
// - "allCapsules": suelta una cápsula de cada power-up del Arcade en fila,
//   frente a la pala, para agarrarlas una detrás de otra sin moverse.
//
// Qué se prueba ahora (en la Batalla y el Modo Historia):
// - "playerPoint": le suma un punto al jugador 1 (sirve para avanzar las fases
//   del jefe final sin jugar cada punto).
// - "allPowerUps": pone en la cancha los 27 power-ups juntos (9 × 3), para
//   ver sus íconos; se pueden agarrar con la pelota como cualquier otro.
// - "effectsDemo": activa juntos varios power-ups (los de DEMO_POWERUP_IDS),
//   como si los hubiera agarrado el jugador 1, para ver los indicadores de
//   duración de los dos lados y los del centro.
// - "powerUp": activa DEBUG_POWERUP_ID sobre la pelota en juego, como si la
//   pelota lo hubiera agarrado. En los verdes y rojos cuenta siempre como si la
//   hubiera mandado el jugador 1 (el verde es para él; el rojo, para el rival).
const DEBUG_ACTION = "effectsDemo";
const DEBUG_POWERUP_ID = "cannon-green";
const DEMO_POWERUP_IDS = [
  "grow-green",
  "invert-red",
  "double-point-green",
  "shield-red",
  "slow-down-green",
  "giant-ball",
  "slow-motion",
  "center-paddle",
];

export default class DebugKey {
  constructor(scene) {
    this.scene = scene;
    if (!import.meta.env.DEV) return;

    scene.input.keyboard.on(`keydown-${DEBUG_KEY}`, () => this.run());
  }

  run() {
    if (this.scene.matchOver) return;

    if (this.scene.wall) {
      if (ARCADE_DEBUG_ACTION === "allCapsules") this.dropAllCapsules();
      else this.breakAllBricksButOne();
      return;
    }

    if (DEBUG_ACTION === "playerPoint") {
      this.scene.awardPoint("p1");
    } else if (DEBUG_ACTION === "allPowerUps") {
      this.spawnAllPowerUps();
    } else if (DEBUG_ACTION === "effectsDemo") {
      DEMO_POWERUP_IDS.forEach((id) => this.activatePowerUp(id));
    } else {
      this.activatePowerUp(DEBUG_POWERUP_ID);
    }
  }

  dropAllCapsules() {
    ARCADE_POWERUPS.forEach((definition, index) => {
      this.scene.drops.drop(CAPSULE_ROW_START_X + index * CAPSULE_ROW_SPACING, this.scene.paddle.y, definition);
    });
  }

  breakAllBricksButOne() {
    const standing = this.scene.wall.breakableBricks;
    standing.slice(1).forEach((brick) => {
      while (!brick.isBroken) brick.hit();
    });
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

  activatePowerUp(powerUpId) {
    const ball = this.scene.ballManager.primary;
    const definition = POWERUP_DEFINITIONS.find((item) => item.id === powerUpId);
    if (!ball || !definition) return;

    const lastTouchedBy = ball.lastTouchedBy;
    ball.lastTouchedBy = "p1";
    this.scene.onPowerUpActivated(definition, ball);
    ball.lastTouchedBy = lastTouchedBy ?? "p1";
  }
}
