import { GAME_WIDTH, COLORS, ARCADE_PLAY_TOP, ARCADE_DANGER_COLOR } from "../config.js";
import { KEYS } from "../enums/keys.js";
import { getPhrase } from "../services/translations.js";
import { pop } from "../ui/Pop.js";

const HUD_Y = 30;
// A la izquierda del ícono de pausa (arriba al centro) van los indicadores de
// los power-ups; a la derecha, el puntaje y, pegado a las vidas, el nivel.
const SCORE_X = GAME_WIDTH / 2 + 36;
const LEVEL_GAP = 18;
const LEVEL_COLOR = "#888888";
const LIFE_RADIUS = 6;
const LIFE_SPACING = 20;
const LIVES_RIGHT_X = GAME_WIDTH - 24;
const DIVIDER_COLOR = 0x444444;
// La vida que se pierde se agranda y se apaga en rojo; la que se gana aparece con un anillo.
const LIFE_CHANGE_SCALE = 2.6;
const LIFE_CHANGE_DURATION = 450;

// Marcador del Arcade: puntaje, nivel y vidas (una pelotita por vida, arriba
// a la derecha), en la franja de arriba, separada de la cancha por una línea.
// La mitad izquierda de la franja queda para los indicadores de los power-ups.
// El puntaje da un saltito cada vez que sube, y las vidas que cambian se animan.
export default class ArcadeHud {
  constructor(scene) {
    this.scene = scene;
    this.score = 0;
    this.livesShown = null; // la primera vez no se anima
    scene.add.rectangle(GAME_WIDTH / 2, ARCADE_PLAY_TOP - 1, GAME_WIDTH, 2, DIVIDER_COLOR);

    this.scoreText = scene.add
      .text(SCORE_X, HUD_Y, "0", { fontSize: "40px", color: COLORS.TEXT })
      .setOrigin(0, 0.5);
    this.levelText = scene.add.text(0, HUD_Y, "", { fontSize: "20px", color: LEVEL_COLOR }).setOrigin(1, 0.5);
    this.lives = scene.add.graphics();
  }

  update(run) {
    this.scoreText.setText(String(run.score));
    if (run.score > this.score) pop(this.scene, this.scoreText, { from: 1.2, duration: 160 });
    this.score = run.score;
    this.levelText.setText(getPhrase(KEYS.NIVEL_N).replace("{n}", run.level));

    this.lives.clear().fillStyle(COLORS.BALL);
    for (let i = 0; i < run.lives; i++) {
      this.lives.fillCircle(LIVES_RIGHT_X - i * LIFE_SPACING, HUD_Y, LIFE_RADIUS);
    }
    if (this.livesShown !== null && run.lives !== this.livesShown) this.animateLifeChange(run.lives);
    this.livesShown = run.lives;

    // El nivel queda justo a la izquierda de la última vida.
    const livesLeftX = LIVES_RIGHT_X - (Math.max(run.lives, 1) - 1) * LIFE_SPACING - LIFE_RADIUS;
    this.levelText.setX(livesLeftX - LEVEL_GAP);
  }

  animateLifeChange(lives) {
    const lost = lives < this.livesShown;
    // Lugar de la vida que se fue (la que estaba más a la izquierda) o de la nueva.
    const index = lost ? lives : lives - 1;
    const x = LIVES_RIGHT_X - index * LIFE_SPACING;
    const mark = lost
      ? this.scene.add.circle(x, HUD_Y, LIFE_RADIUS, ARCADE_DANGER_COLOR)
      : this.scene.add.circle(x, HUD_Y, LIFE_RADIUS).setStrokeStyle(2, COLORS.BALL);

    this.scene.tweens.add({
      targets: mark,
      scale: LIFE_CHANGE_SCALE,
      alpha: 0,
      duration: LIFE_CHANGE_DURATION,
      ease: "Quad.easeOut",
      onComplete: () => mark.destroy(),
    });
  }
}
