import { GAME_WIDTH, COLORS, ARCADE_PLAY_TOP } from "../config.js";
import { KEYS } from "../enums/keys.js";
import { getPhrase } from "../services/translations.js";

const HUD_Y = 30;
// El puntaje y el nivel van a los costados del ícono de pausa (arriba al centro).
const SIDE_OFFSET = 36;
const LEVEL_COLOR = "#888888";
const LIFE_RADIUS = 6;
const LIFE_SPACING = 20;
const LIVES_RIGHT_X = GAME_WIDTH - 24;
const DIVIDER_COLOR = 0x444444;

// Marcador del Arcade: puntaje, nivel y vidas (una pelotita por vida, arriba
// a la derecha), en la franja de arriba, separada de la cancha por una línea.
export default class ArcadeHud {
  constructor(scene) {
    scene.add.rectangle(GAME_WIDTH / 2, ARCADE_PLAY_TOP - 1, GAME_WIDTH, 2, DIVIDER_COLOR);

    this.scoreText = scene.add
      .text(GAME_WIDTH / 2 - SIDE_OFFSET, HUD_Y, "0", { fontSize: "40px", color: COLORS.TEXT })
      .setOrigin(1, 0.5);
    this.levelText = scene.add
      .text(GAME_WIDTH / 2 + SIDE_OFFSET, HUD_Y, "", { fontSize: "20px", color: LEVEL_COLOR })
      .setOrigin(0, 0.5);
    this.lives = scene.add.graphics();
  }

  update(run) {
    this.scoreText.setText(String(run.score));
    this.levelText.setText(getPhrase(KEYS.NIVEL_N).replace("{n}", run.level));

    this.lives.clear().fillStyle(COLORS.BALL);
    for (let i = 0; i < run.lives; i++) {
      this.lives.fillCircle(LIVES_RIGHT_X - i * LIFE_SPACING, HUD_Y, LIFE_RADIUS);
    }
  }
}
