import Phaser from "phaser";
import { GAME_TITLE, GAME_WIDTH, GAME_HEIGHT, COLORS, POWERUP_COLORS, BOSS_TEXT_COLOR, CREDITS } from "../config.js";
import { LEVELS } from "../data/levels.js";
import { KEYS } from "../enums/keys.js";
import { getPhrase } from "../services/translations.js";
import { playVictoryFanfare } from "../systems/SoundEffects.js";
import MenuList from "../ui/MenuList.js";
import { addBackNavigation } from "../ui/IconButton.js";

const RIVALS_TOP = 205;
const RIVAL_ROW_SPACING = 30;
const RIVAL_COLUMN_OFFSET = 150;
const CHECK_COLOR = "#33dd55";
const CONFETTI_COUNT = 50;

// Pantalla final del Modo Historia, después de ganarle al Campeón: título,
// los 10 rivales derrotados, créditos y papelitos de festejo.
export default class StoryEndScene extends Phaser.Scene {
  constructor() {
    super("StoryEndScene");
  }

  create() {
    this.spawnConfetti();

    this.add
      .text(GAME_WIDTH / 2, 80, getPhrase(KEYS.SOS_EL_NUEVO_CAMPEON_DE_GAME).replace("{game}", GAME_TITLE), {
        fontSize: "34px",
        color: BOSS_TEXT_COLOR,
        align: "center",
        wordWrap: { width: GAME_WIDTH - 80 },
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 160, getPhrase(KEYS.RIVALES_DERROTADOS), { fontSize: "18px", color: "#888888" })
      .setOrigin(0.5);

    this.showRivals();

    this.add
      .text(GAME_WIDTH / 2, 410, getPhrase(KEYS.UN_JUEGO_DE).replace("{names}", CREDITS), {
        fontSize: "16px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5);

    new MenuList(this, {
      y: 490,
      fontSize: "22px",
      items: [{ labelKey: KEYS.SELECCION_DE_NIVEL, action: () => this.goToLevelSelect() }],
    });
    addBackNavigation(this, () => this.goToLevelSelect());

    playVictoryFanfare();
  }

  // Los 10 rivales en dos columnas (1 a 5 y 6 a 10), alineados a la izquierda,
  // cada uno con un ✓ verde. Los jefes van en violeta.
  showRivals() {
    const perColumn = Math.ceil(LEVELS.length / 2);

    LEVELS.forEach((level, index) => {
      const columnX = GAME_WIDTH / 2 + (index < perColumn ? -RIVAL_COLUMN_OFFSET : RIVAL_COLUMN_OFFSET) - 90;
      const y = RIVALS_TOP + (index % perColumn) * RIVAL_ROW_SPACING;

      this.add.text(columnX, y, "✓", { fontSize: "18px", color: CHECK_COLOR }).setOrigin(0, 0.5);
      this.add
        .text(columnX + 24, y, `${level.id}. ${getPhrase(level.nameKey)}`, {
          fontSize: "18px",
          color: level.boss ? BOSS_TEXT_COLOR : COLORS.TEXT,
        })
        .setOrigin(0, 0.5);
    });
  }

  // Papelitos de los colores de los power-ups que caen en loop por detrás del texto.
  spawnConfetti() {
    const colors = Object.values(POWERUP_COLORS);

    for (let i = 0; i < CONFETTI_COUNT; i++) {
      const piece = this.add
        .rectangle(
          Phaser.Math.Between(0, GAME_WIDTH),
          Phaser.Math.Between(-GAME_HEIGHT, 0),
          6,
          10,
          Phaser.Utils.Array.GetRandom(colors),
          0.8
        )
        .setAngle(Phaser.Math.Between(0, 360));

      this.tweens.add({
        targets: piece,
        y: GAME_HEIGHT + 20,
        angle: piece.angle + Phaser.Math.Between(180, 540),
        duration: Phaser.Math.Between(3000, 6000),
        delay: Phaser.Math.Between(0, 3000),
        repeat: -1,
        onRepeat: () => piece.setX(Phaser.Math.Between(0, GAME_WIDTH)),
      });
    }
  }

  goToLevelSelect() {
    this.scene.start("LevelSelectScene");
  }
}
